"""AI analysis service -- uses user's own food/drink data as context for LLM."""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.food import Food
from app.models.drink import Drink
from app.services.llm_service import LLMService
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI service that combines user data with LLM for personalized insights."""

    def __init__(self):
        self.llm = LLMService(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_BASE_URL,
            default_model=settings.LLM_DEFAULT_MODEL,
        )

    # ---- data gathering helpers ----

    async def _get_recent_foods(
        self, db: AsyncSession, days: int = 30, limit: int = 50
    ) -> List[dict]:
        """Get recent food records."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = (
            select(Food)
            .where(Food.create_time >= since)
            .order_by(Food.create_time.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        return [f.to_dict() for f in result.scalars().all()]

    async def _get_recent_drinks(
        self, db: AsyncSession, days: int = 30, limit: int = 50
    ) -> List[dict]:
        """Get recent drink records."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = (
            select(Drink)
            .where(Drink.create_time >= since)
            .order_by(Drink.create_time.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        return [d.to_dict() for d in result.scalars().all()]

    async def _get_top_rated_foods(
        self, db: AsyncSession, min_star: int = 4, limit: int = 20
    ) -> List[dict]:
        """Get highly rated foods."""
        query = (
            select(Food)
            .where(Food.star >= min_star)
            .order_by(Food.star.desc(), Food.create_time.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        return [f.to_dict() for f in result.scalars().all()]

    async def _get_top_rated_drinks(
        self, db: AsyncSession, min_star: int = 4, limit: int = 20
    ) -> List[dict]:
        """Get highly rated drinks."""
        query = (
            select(Drink)
            .where(Drink.star >= min_star)
            .order_by(Drink.star.desc(), Drink.create_time.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        return [d.to_dict() for d in result.scalars().all()]

    async def _get_food_stats(
        self, db: AsyncSession, days: int = 30
    ) -> Dict[str, Any]:
        """Aggregate food statistics for a period."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = select(Food).where(Food.create_time >= since)
        result = await db.execute(query)
        foods = result.scalars().all()

        if not foods:
            return {"count": 0}

        categories = {}
        flavors = {}
        makers = {}
        stars = []
        tags_count = {}

        for f in foods:
            if f.category:
                categories[f.category] = categories.get(f.category, 0) + 1
            if f.flavor:
                flavors[f.flavor] = flavors.get(f.flavor, 0) + 1
            if f.maker:
                makers[f.maker] = makers.get(f.maker, 0) + 1
            if f.star is not None:
                stars.append(f.star)
            if f.tags:
                for t in f.tags:
                    tags_count[t] = tags_count.get(t, 0) + 1

        return {
            "count": len(foods),
            "avg_star": round(sum(stars) / len(stars), 1) if stars else 0,
            "top_categories": sorted(categories.items(), key=lambda x: -x[1])[:5],
            "top_flavors": sorted(flavors.items(), key=lambda x: -x[1])[:5],
            "top_makers": sorted(makers.items(), key=lambda x: -x[1])[:5],
            "top_tags": sorted(tags_count.items(), key=lambda x: -x[1])[:5],
        }

    async def _get_drink_stats(
        self, db: AsyncSession, days: int = 30
    ) -> Dict[str, Any]:
        """Aggregate drink statistics for a period."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = select(Drink).where(Drink.create_time >= since)
        result = await db.execute(query)
        drinks = result.scalars().all()

        if not drinks:
            return {"count": 0}

        brands = {}
        flavors = {}
        types = {}
        sweetness = {}
        stars = []
        tags_count = {}

        for d in drinks:
            if d.brand:
                brands[d.brand] = brands.get(d.brand, 0) + 1
            if d.flavor:
                flavors[d.flavor] = flavors.get(d.flavor, 0) + 1
            if d.drink_type:
                types[d.drink_type] = types.get(d.drink_type, 0) + 1
            if d.sweetness:
                sweetness[d.sweetness] = sweetness.get(d.sweetness, 0) + 1
            if d.star is not None:
                stars.append(d.star)
            if d.tags:
                for t in d.tags:
                    tags_count[t] = tags_count.get(t, 0) + 1

        return {
            "count": len(drinks),
            "avg_star": round(sum(stars) / len(stars), 1) if stars else 0,
            "top_brands": sorted(brands.items(), key=lambda x: -x[1])[:5],
            "top_flavors": sorted(flavors.items(), key=lambda x: -x[1])[:5],
            "top_types": sorted(types.items(), key=lambda x: -x[1])[:5],
            "top_sweetness": sorted(sweetness.items(), key=lambda x: -x[1])[:5],
            "top_tags": sorted(tags_count.items(), key=lambda x: -x[1])[:5],
        }

    # ---- prompt builders ----

    def _build_suggest_prompt(
        self,
        top_foods: List[dict],
        top_drinks: List[dict],
        food_stats: Dict,
        drink_stats: Dict,
        category: Optional[str],
        extra_prompt: Optional[str],
    ) -> str:
        """Build prompt for food/drink suggestion."""
        parts = [
            "你是一个美食/饮品推荐助手。根据用户的历史记录，推荐他今天应该吃什么/喝什么。",
            "请从用户的高评分记录中挑选，并给出推荐理由。回答用中文。",
            "",
            "--- 用户的高评分美食 ---",
        ]

        if top_foods:
            for f in top_foods[:10]:
                parts.append(
                    f"- {f['title']} (评分: {f['star']}, 口味: {f['flavor']}, "
                    f"分类: {f['category']}, 制作者: {f['maker']})"
                )
        else:
            parts.append("（暂无美食记录）")

        parts.append("")
        parts.append("--- 用户的高评分饮品 ---")

        if top_drinks:
            for d in top_drinks[:10]:
                parts.append(
                    f"- {d['title']} (评分: {d['star']}, 品牌: {d['brand']}, "
                    f"口味: {d['flavor']}, 类型: {d['drink_type']})"
                )
        else:
            parts.append("（暂无饮品记录）")

        parts.append("")
        parts.append(f"--- 美食统计（近30天）: 共 {food_stats.get('count', 0)} 条，"
                      f"平均评分 {food_stats.get('avg_star', 0)} ---")
        if food_stats.get("top_categories"):
            cats = ", ".join(f"{c}({n}次)" for c, n in food_stats["top_categories"][:3])
            parts.append(f"常做分类: {cats}")
        if food_stats.get("top_flavors"):
            flvs = ", ".join(f"{f}({n}次)" for f, n in food_stats["top_flavors"][:3])
            parts.append(f"常做口味: {flvs}")

        parts.append("")
        parts.append(f"--- 饮品统计（近30天）: 共 {drink_stats.get('count', 0)} 条，"
                      f"平均评分 {drink_stats.get('avg_star', 0)} ---")
        if drink_stats.get("top_brands"):
            brs = ", ".join(f"{b}({n}次)" for b, n in drink_stats["top_brands"][:3])
            parts.append(f"常喝品牌: {brs}")

        if category and category != "all":
            parts.append(f"\n用户只想看 {category} 类的推荐。")

        if extra_prompt:
            parts.append(f"\n用户额外要求: {extra_prompt}")

        parts.append(
            "\n请给出 2-3 个推荐（可以是美食或饮品），每个推荐说明：\n"
            "1. 推荐哪个具体菜品/饮品\n"
            "2. 为什么推荐（基于用户的偏好数据）\n"
            "3. 一句鼓励的话"
        )

        return "\n".join(parts)

    def _build_analyze_prompt(
        self,
        food_stats: Dict,
        drink_stats: Dict,
        recent_foods: List[dict],
        recent_drinks: List[dict],
        extra_question: Optional[str],
    ) -> str:
        """Build prompt for habit analysis."""
        parts = [
            "你是一个饮食分析助手。根据用户的饮食记录，分析他的饮食习惯。",
            "回答用中文，语气亲切，像朋友一样。",
            "",
            "--- 美食数据（近N天）---",
            f"总记录数: {food_stats.get('count', 0)}",
            f"平均评分: {food_stats.get('avg_star', 0)}",
        ]

        if food_stats.get("top_categories"):
            cats = ", ".join(f"{c}({n}次)" for c, n in food_stats["top_categories"])
            parts.append(f"菜品分类: {cats}")
        if food_stats.get("top_flavors"):
            flvs = ", ".join(f"{f}({n}次)" for f, n in food_stats["top_flavors"])
            parts.append(f"口味偏好: {flvs}")
        if food_stats.get("top_makers"):
            mks = ", ".join(f"{m}({n}次)" for m, n in food_stats["top_makers"])
            parts.append(f"常做菜的人: {mks}")

        parts.append("")
        parts.append("--- 饮品数据（近N天）---")
        parts.append(f"总记录数: {drink_stats.get('count', 0)}")
        parts.append(f"平均评分: {drink_stats.get('avg_star', 0)}")

        if drink_stats.get("top_brands"):
            brs = ", ".join(f"{b}({n}次)" for b, n in drink_stats["top_brands"])
            parts.append(f"常喝品牌: {brs}")
        if drink_stats.get("top_sweetness"):
            sws = ", ".join(f"{s}({n}次)" for s, n in drink_stats["top_sweetness"])
            parts.append(f"甜度偏好: {sws}")

        if extra_question:
            parts.append(f"\n用户特别问题: {extra_question}")

        parts.append(
            "\n请分析：\n"
            "1. 用户的饮食偏好总结\n"
            "2. 有没有什么有趣的发现或趋势\n"
            "3. 给出一个实用的饮食建议\n"
            "4. 如果有问题（如吃太多、营养不均衡等），温柔地提醒"
        )

        return "\n".join(parts)

    def _build_insight_prompt(
        self,
        food_stats: Dict,
        drink_stats: Dict,
        recent_foods: List[dict],
        recent_drinks: List[dict],
    ) -> str:
        """Build prompt for daily insight."""
        parts = [
            "你是一个一句话饮食洞察助手。根据用户最近的饮食记录，",
            "用一句有趣的话总结今天的饮食状况，再给一个实用小建议。",
            "回答要简短、有趣、有用。回答用中文。",
            "",
            f"最近美食记录: {food_stats.get('count', 0)} 条, 平均评分 {food_stats.get('avg_star', 0)}",
            f"最近饮品记录: {drink_stats.get('count', 0)} 条, 平均评分 {drink_stats.get('avg_star', 0)}",
        ]

        if recent_foods:
            last = recent_foods[0]
            parts.append(f"最新美食: {last['title']} (评分 {last['star']})")
        if recent_drinks:
            last = recent_drinks[0]
            parts.append(f"最新饮品: {last['title']} (评分 {last['star']})")

        if food_stats.get("top_flavors"):
            top_flv = food_stats["top_flavors"][0][0]
            parts.append(f"最常做口味: {top_flv}")

        parts.append(
            "\n请回复两行：\n"
            "第一行: 一句话洞察（有趣、个性化）\n"
            "第二行: 一个实用小建议"
        )

        return "\n".join(parts)

    # ---- main methods ----

    async def suggest(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        extra_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get personalized food/drink suggestions."""
        top_foods = await self._get_top_rated_foods(db)
        top_drinks = await self._get_top_rated_drinks(db)
        food_stats = await self._get_food_stats(db)
        drink_stats = await self._get_drink_stats(db)

        prompt = self._build_suggest_prompt(
            top_foods, top_drinks, food_stats, drink_stats,
            category, extra_prompt,
        )

        from app.schemas.llm import LLMGenerateRequest
        req = LLMGenerateRequest(
            model=settings.LLM_DEFAULT_MODEL,
            prompt=prompt,
            max_tokens=800,
            temperature=0.7,
        )
        result = await self.llm.generate(req)

        return {
            "suggestion": result.get("response", ""),
            "suggested_items": top_foods[:3],
            "reason": "基于你的高评分记录和口味偏好",
        }

    async def analyze(
        self,
        db: AsyncSession,
        days: int = 30,
        category: Optional[str] = None,
        extra_question: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze eating/drinking habits."""
        foods = await self._get_recent_foods(db, days=days)
        drinks = await self._get_recent_drinks(db, days=days)
        food_stats = await self._get_food_stats(db, days=days)
        drink_stats = await self._get_drink_stats(db, days=days)

        prompt = self._build_analyze_prompt(
            food_stats, drink_stats, foods, drinks, extra_question,
        )

        from app.schemas.llm import LLMGenerateRequest
        req = LLMGenerateRequest(
            model=settings.LLM_DEFAULT_MODEL,
            prompt=prompt,
            max_tokens=1200,
            temperature=0.7,
        )
        result = await self.llm.generate(req)

        return {
            "summary": result.get("response", ""),
            "stats": {
                "food": food_stats,
                "drink": drink_stats,
            },
        }

    async def insight(
        self,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """Get a quick daily insight."""
        foods = await self._get_recent_foods(db, days=7, limit=5)
        drinks = await self._get_recent_drinks(db, days=7, limit=5)
        food_stats = await self._get_food_stats(db, days=7)
        drink_stats = await self._get_drink_stats(db, days=7)

        prompt = self._build_insight_prompt(
            food_stats, drink_stats, foods, drinks,
        )

        from app.schemas.llm import LLMGenerateRequest
        req = LLMGenerateRequest(
            model=settings.LLM_DEFAULT_MODEL,
            prompt=prompt,
            max_tokens=300,
            temperature=0.8,
        )
        result = await self.llm.generate(req)

        response = result.get("response", "")
        lines = [l.strip() for l in response.split("\n") if l.strip()]

        return {
            "insight": lines[0] if lines else response,
            "tip": lines[1] if len(lines) > 1 else "",
        }
