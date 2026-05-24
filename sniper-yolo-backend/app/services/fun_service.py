"""Fun service layer - SQLAlchemy and PostgreSQL"""
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.fun import Fun
from app.schemas.fun import FunCreate, FunUpdate

logger = logging.getLogger(__name__)


class FunService:
    """娱乐信息服务类 - 实现增删改查等业务逻辑"""

    async def create_fun(self, fun_data: FunCreate, created_by: int, db: AsyncSession) -> Dict[str, Any]:
        """创建新的娱乐信息"""
        try:
            logger.info(f"创建娱乐信息: {fun_data.title}, 创建人: {created_by}")

            if not fun_data.title or not fun_data.maker:
                raise ValueError("标题和推荐来源为必需字段")

            if fun_data.star is not None and (fun_data.star < 1 or fun_data.star > 5):
                raise ValueError("评分必须在1-5之间")

            now = datetime.now(timezone.utc)
            new_fun = Fun(
                title=fun_data.title,
                content=fun_data.content or "",
                cover=fun_data.cover or "",
                images=fun_data.images or [],
                tags=fun_data.tags or [],
                star=fun_data.star,
                maker=fun_data.maker,
                flavor=fun_data.flavor or "",
                created_by=created_by,
                updated_by=created_by,
                create_time=now,
                update_time=now
            )

            db.add(new_fun)
            await db.commit()
            await db.refresh(new_fun)

            logger.info(f"娱乐信息创建成功: {new_fun.id}")
            return new_fun.to_dict()

        except Exception as e:
            logger.error(f"创建娱乐信息失败: {str(e)}", exc_info=True)
            raise

    async def get_fun(self, fun_id: int, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """根据ID获取娱乐信息"""
        try:
            logger.info(f"获取娱乐信息: {fun_id}")
            result = await db.execute(select(Fun).where(Fun.id == fun_id))
            fun = result.scalar_one_or_none()
            if fun:
                return fun.to_dict()
            return None
        except Exception as e:
            logger.error(f"获取娱乐信息失败: {str(e)}", exc_info=True)
            raise

    async def update_fun(self, fun_id: int, fun_data: FunUpdate, updated_by: int, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """根据ID更新娱乐信息"""
        try:
            logger.info(f"更新娱乐信息: {fun_id}, 更新人: {updated_by}")

            result = await db.execute(select(Fun).where(Fun.id == fun_id))
            fun = result.scalar_one_or_none()

            if not fun:
                logger.warning(f"娱乐信息不存在: {fun_id}")
                return None

            update_data = fun_data.model_dump(exclude_unset=True)

            if update_data:
                for key, value in update_data.items():
                    setattr(fun, key, value)

                fun.updated_by = updated_by
                fun.update_time = datetime.now(timezone.utc)

                await db.commit()
                await db.refresh(fun)

            logger.info(f"娱乐信息更新成功: {fun_id}")
            return fun.to_dict()

        except Exception as e:
            logger.error(f"更新娱乐信息失败: {str(e)}", exc_info=True)
            raise

    async def delete_fun(self, fun_id: int, db: AsyncSession) -> bool:
        """根据ID删除娱乐信息"""
        try:
            logger.info(f"删除娱乐信息: {fun_id}")

            result = await db.execute(select(Fun).where(Fun.id == fun_id))
            fun = result.scalar_one_or_none()

            if not fun:
                logger.warning(f"娱乐信息不存在: {fun_id}")
                return False

            await db.delete(fun)
            await db.commit()

            logger.info(f"娱乐信息删除成功: {fun_id}")
            return True

        except Exception as e:
            logger.error(f"删除娱乐信息失败: {str(e)}", exc_info=True)
            raise

    async def search_funs(self,
                         title: Optional[str] = None,
                         maker: Optional[str] = None,
                         min_star: Optional[int] = None,
                         max_star: Optional[int] = None,
                         flavor: Optional[str] = None,
                         tag: Optional[str] = None,
                         db: AsyncSession = None,
                         limit: int = 10,
                         skip: int = 0) -> List[Dict[str, Any]]:
        """搜索娱乐信息"""
        try:
            logger.info(f"搜索娱乐信息，title: {title}, maker: {maker}, min_star: {min_star}, max_star: {max_star}, flavor: {flavor}, tag: {tag}, skip: {skip}, limit: {limit}")

            query = select(Fun)

            if title:
                query = query.where(Fun.title.ilike(f"%{title}%"))

            if maker:
                query = query.where(Fun.maker == maker)

            if min_star is not None:
                query = query.where(Fun.star >= min_star)

            if max_star is not None:
                query = query.where(Fun.star <= max_star)

            if flavor:
                query = query.where(Fun.flavor == flavor)

            if tag:
                query = query.where(Fun.tags.contains([tag]))

            query = query.order_by(Fun.create_time.desc()).offset(skip).limit(limit)
            result = await db.execute(query)
            funs = result.scalars().all()

            return [fun.to_dict() for fun in funs]
        except Exception as e:
            logger.error(f"搜索娱乐信息失败: {str(e)}", exc_info=True)
            raise

    async def search_funs_count(
        self,
        title: Optional[str] = None,
        maker: Optional[str] = None,
        min_star: Optional[int] = None,
        max_star: Optional[int] = None,
        flavor: Optional[str] = None,
        tag: Optional[str] = None,
        db: AsyncSession = None
    ) -> int:
        """获取符合条件的娱乐信息总数"""
        try:
            logger.info(f"获取符合条件的娱乐信息总数，title: {title}, maker: {maker}, min_star: {min_star}, max_star: {max_star}, flavor: {flavor}, tag: {tag}")

            query = select(func.count(Fun.id))

            if title:
                query = query.where(Fun.title.ilike(f"%{title}%"))

            if maker:
                query = query.where(Fun.maker == maker)

            if min_star is not None:
                query = query.where(Fun.star >= min_star)

            if max_star is not None:
                query = query.where(Fun.star <= max_star)

            if flavor:
                query = query.where(Fun.flavor == flavor)

            if tag:
                query = query.where(Fun.tags.contains([tag]))

            result = await db.execute(query)
            return result.scalar()

        except Exception as e:
            logger.error(f"获取符合条件的娱乐信息总数失败: {str(e)}", exc_info=True)
            raise
