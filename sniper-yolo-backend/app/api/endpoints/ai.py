"""AI analysis API endpoints - personalized suggestions and habit analysis."""
import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.ai import (
    AISuggestRequest,
    AIAnalyzeRequest,
    AIInsightRequest,
)
from app.services.ai_service import AIService
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.utils.response import ApiSuccessResponse, ApiErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/suggest", response_model=ApiSuccessResponse)
async def ai_suggest(
    request: AISuggestRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """AI personalized food/drink suggestions based on user's own records."""
    try:
        logger.info(f"用户 {current_user.username} 请求AI推荐: category={request.category}")

        ai_service = AIService()
        result = await ai_service.suggest(
            db=db,
            category=request.category,
            extra_prompt=request.extra_prompt,
        )

        return ApiSuccessResponse.create(
            data=result,
            msg="AI推荐成功",
        )

    except Exception as e:
        logger.error(f"AI推荐失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="A00099",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"AI推荐失败: {str(e)}",
        )


@router.post("/analyze", response_model=ApiSuccessResponse)
async def ai_analyze(
    request: AIAnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """AI analysis of eating/drinking habits over a period."""
    try:
        logger.info(
            f"用户 {current_user.username} 请求AI分析: "
            f"period={request.period_days}d, category={request.category}"
        )

        ai_service = AIService()
        result = await ai_service.analyze(
            db=db,
            days=request.period_days,
            category=request.category,
            extra_question=request.extra_question,
        )

        return ApiSuccessResponse.create(
            data=result,
            msg="AI分析完成",
        )

    except Exception as e:
        logger.error(f"AI分析失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="A00099",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"AI分析失败: {str(e)}",
        )


@router.post("/insight", response_model=ApiSuccessResponse)
async def ai_insight(
    request: AIInsightRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Quick daily AI insight - one-liner summary + tip."""
    try:
        logger.info(f"用户 {current_user.username} 请求AI每日洞察")

        ai_service = AIService()
        result = await ai_service.insight(db=db)

        return ApiSuccessResponse.create(
            data=result,
            msg="获取洞察成功",
        )

    except Exception as e:
        logger.error(f"AI洞察失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="A00099",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"AI洞察失败: {str(e)}",
        )
