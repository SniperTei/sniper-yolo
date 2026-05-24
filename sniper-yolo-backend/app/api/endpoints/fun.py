"""娱乐相关API端点 - 使用统一响应格式和PostgreSQL"""
from typing import Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.fun import FunCreate, FunUpdate
from app.models.user import User
from app.services.fun_service import FunService
from app.core.dependencies import get_current_active_user, get_db
from app.utils.response import ApiSuccessResponse, ApiErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=ApiSuccessResponse)
async def create_fun(
    fun: FunCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> ApiSuccessResponse:
    """创建新娱乐记录"""
    try:
        logger.info(f"用户 {current_user.username} 尝试创建娱乐记录: {fun.title}")

        fun_service = FunService()
        new_fun = await fun_service.create_fun(fun, int(current_user.id), db)

        logger.info(f"娱乐记录创建成功: {new_fun['title']}")

        return ApiSuccessResponse.create(
            data=new_fun,
            msg="娱乐项目创建成功",
            status_code=status.HTTP_201_CREATED
        )

    except ValueError as e:
        logger.warning(f"娱乐项目创建验证失败: {str(e)}")
        return ApiErrorResponse.create(
            code="A00003",
            status_code=status.HTTP_400_BAD_REQUEST,
            msg=str(e)
        )
    except Exception as e:
        logger.error(f"娱乐项目创建服务器错误: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="A00099",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"服务器内部错误: {str(e)}"
        )


@router.get("/", response_model=ApiSuccessResponse)
async def read_funs(
    page: int = 1,
    count: int = 10,
    title: Optional[str] = None,
    maker: Optional[str] = None,
    min_star: Optional[int] = None,
    max_star: Optional[int] = None,
    flavor: Optional[str] = None,
    tag: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> ApiSuccessResponse:
    """获取娱乐记录列表（支持条件查询和分页）"""
    try:
        skip = (page - 1) * count

        logger.info(f"获取娱乐记录列表，page={page}, count={count}, title={title}, maker={maker}, min_star={min_star}, max_star={max_star}, flavor={flavor}, tag={tag}")

        fun_service = FunService()
        funs = await fun_service.search_funs(
            title=title,
            maker=maker,
            min_star=min_star,
            max_star=max_star,
            flavor=flavor,
            tag=tag,
            db=db,
            skip=skip,
            limit=count
        )

        total = await fun_service.search_funs_count(
            title=title,
            maker=maker,
            min_star=min_star,
            max_star=max_star,
            flavor=flavor,
            tag=tag,
            db=db
        )

        return ApiSuccessResponse.create(
            data={
                "funs": funs,
                "total": total,
                "page": page,
                "count": count
            },
            msg="获取娱乐列表成功"
        )

    except Exception as e:
        logger.error(f"获取娱乐列表失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="B00500",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"服务器内部错误: {str(e)}"
        )


@router.get("/{fun_id}", response_model=ApiSuccessResponse)
async def get_fun(
    fun_id: int,
    db: AsyncSession = Depends(get_db)
) -> ApiSuccessResponse:
    """根据 ID 获取单个娱乐项目"""
    try:
        logger.info(f"获取娱乐项目: {fun_id}")
        fun_service = FunService()
        fun = await fun_service.get_fun(fun_id, db)
        if not fun:
            return ApiErrorResponse.create(
                code="B00404",
                status_code=status.HTTP_404_NOT_FOUND,
                msg="娱乐项目不存在"
            )

        return ApiSuccessResponse.create(
            data=fun,
            msg="获取娱乐项目成功"
        )
    except Exception as e:
        logger.error(f"获取娱乐项目失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="B00500",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"服务器内部错误: {str(e)}"
        )


@router.put("/{fun_id}", response_model=ApiSuccessResponse)
async def update_fun(
    fun_id: int,
    fun: FunUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> ApiSuccessResponse:
    """根据 ID 更新单个娱乐项目"""
    try:
        fun_service = FunService()
        updated = await fun_service.update_fun(
            fun_id,
            fun,
            int(current_user.id),
            db
        )
        if not updated:
            return ApiErrorResponse.create(
                code="B00404",
                status_code=status.HTTP_404_NOT_FOUND,
                msg="娱乐项目不存在"
            )
        return ApiSuccessResponse.create(data=updated, msg="更新成功")
    except Exception as e:
        logger.error(f"更新娱乐项目失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="B00500",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"服务器内部错误: {str(e)}"
        )


@router.delete("/{fun_id}", response_model=ApiSuccessResponse)
async def delete_fun(
    fun_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> ApiSuccessResponse:
    """根据 ID 删除单个娱乐项目"""
    try:
        fun_service = FunService()
        deleted = await fun_service.delete_fun(fun_id, db)
        if not deleted:
            return ApiErrorResponse.create(
                code="B00404",
                status_code=status.HTTP_404_NOT_FOUND,
                msg="娱乐项目不存在"
            )
        return ApiSuccessResponse.create(data=None, msg="删除成功")
    except Exception as e:
        logger.error(f"删除娱乐项目失败: {str(e)}", exc_info=True)
        return ApiErrorResponse.create(
            code="B00500",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            msg=f"服务器内部错误: {str(e)}"
        )
