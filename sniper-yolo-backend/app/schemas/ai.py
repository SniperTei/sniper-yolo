"""Pydantic models for AI analysis requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AISuggestRequest(BaseModel):
    """Request model for AI food/drink suggestions."""
    category: Optional[str] = Field(default=None, description="类型：food, drink, all")
    extra_prompt: Optional[str] = Field(
        default=None,
        description="用户额外要求，如 '想吃辣的'、'推荐饮料'"
    )


class AIAnalyzeRequest(BaseModel):
    """Request model for AI habit analysis."""
    period_days: int = Field(default=30, ge=1, le=365, description="分析天数，默认30天")
    category: Optional[str] = Field(default=None, description="类型：food, drink, all")
    extra_question: Optional[str] = Field(
        default=None,
        description="用户额外问题，如 '我是不是吃太甜了'"
    )


class AIInsightRequest(BaseModel):
    """Request model for quick AI daily insight."""
    pass


class AISuggestResponse(BaseModel):
    """Response model for AI suggestions."""
    suggestion: str = Field(..., description="AI建议内容")
    suggested_items: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="推荐的具体项目（从用户记录中挑选）"
    )
    reason: str = Field(default="", description="推荐理由")


class AIAnalyzeResponse(BaseModel):
    """Response model for AI analysis."""
    summary: str = Field(..., description="AI分析总结")
    stats: Dict[str, Any] = Field(default_factory=dict, description="统计数据")


class AIInsightResponse(BaseModel):
    """Response model for daily insight."""
    insight: str = Field(..., description="今日一句话洞察")
    tip: str = Field(default="", description="实用建议")
