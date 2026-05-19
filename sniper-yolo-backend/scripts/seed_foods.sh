#!/bin/bash
# ============================================
# Sniper YOLO - 美食种子数据
# 用法: bash scripts/seed_foods.sh
#
# 环境变量:
#   DB_HOST     (默认 127.0.0.1)
#   DB_PORT     (默认 5432)
#   DB_NAME     (默认 sniper_yolo)
#   DB_USER     (默认 sniper)
#   DB_PASSWORD (必填)
#   CREATED_BY  (默认 1)
# ============================================

set -e

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sniper_yolo}"
DB_USER="${DB_USER:-sniper}"
DB_PASSWORD="${DB_PASSWORD:-}"
CREATED_BY="${CREATED_BY:-1}"

if [ -z "$DB_PASSWORD" ]; then
    echo "错误: 请设置 DB_PASSWORD"
    echo "用法: DB_PASSWORD=your_password bash scripts/seed_foods.sh"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"
PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"

echo "→ 插入美食数据..."

$PSQL_CMD <<EOF
INSERT INTO foods (title, maker, star, flavor, category, tags, created_by) VALUES
-- 荤菜
('孜盐牛肉', '家饭朴老师', 4, '咸香', '荤菜', ARRAY['牛肉','孜然'], $CREATED_BY),
('수육', '家饭朴老师', 4, '清淡', '荤菜', ARRAY['韩式','水煮肉'], $CREATED_BY),
('锅包肉', '家饭朴老师', 5, '酸甜', '荤菜', ARRAY['东北菜','猪肉'], $CREATED_BY),
('辣鱿鱼', '家饭朴老师', 4, '香辣', '荤菜', ARRAY['鱿鱼','辣'], $CREATED_BY),
('可乐鸡翅', '家饭朴老师', 4, '甜咸', '荤菜', ARRAY['鸡翅','快手菜'], $CREATED_BY),
('红烧排骨', '家饭朴老师', 5, '咸鲜', '荤菜', ARRAY['排骨','红烧'], $CREATED_BY),
('金燕式肥牛饭', '家饭朴老师', 4, '咸鲜', '荤菜', ARRAY['牛肉','盖饭'], $CREATED_BY),
('香辣肉丝', '家饭朴老师', 4, '香辣', '荤菜', ARRAY['猪肉','辣'], $CREATED_BY),
('香辣蟹', '家饭朴老师', 5, '香辣', '荤菜', ARRAY['螃蟹','海鲜'], $CREATED_BY),
('辣炒蚬子', '家饭朴老师', 4, '香辣', '荤菜', ARRAY['蚬子','海鲜'], $CREATED_BY),
('清蒸金昌鱼', '家饭朴老师', 5, '鲜香', '荤菜', ARRAY['鱼','清蒸'], $CREATED_BY),
('煎刀鱼', '家饭朴老师', 4, '咸香', '荤菜', ARRAY['刀鱼','煎'], $CREATED_BY),
('秋刀鱼', '家饭朴老师', 4, '咸香', '荤菜', ARRAY['秋刀鱼','烤'], $CREATED_BY),
('금연양념치킨', '家饭朴老师', 4, '香辣', '荤菜', ARRAY['韩式','炸鸡'], $CREATED_BY),
('鸡蛋虾仁', '家饭朴老师', 4, '鲜香', '荤菜', ARRAY['虾仁','鸡蛋'], $CREATED_BY),
('매운양념명태구이', '家饭朴老师', 4, '香辣', '荤菜', ARRAY['韩式','明太鱼'], $CREATED_BY),
('닭복음탕', '家饭朴老师', 4, '香辣', '荤菜', ARRAY['韩式','鸡汤'], $CREATED_BY),
('크림새우', '家饭朴老师', 4, '奶香', '荤菜', ARRAY['韩式','虾仁'], $CREATED_BY),
('西兰花炒虾仁', '家饭朴老师', 4, '鲜香', '荤菜', ARRAY['虾仁','西兰花'], $CREATED_BY),
('泡椒牛肉', '家饭朴老师', 4, '酸辣', '荤菜', ARRAY['牛肉','泡椒'], $CREATED_BY),
('青椒酿虾滑', '家饭朴老师', 4, '鲜香', '荤菜', ARRAY['虾滑','青椒'], $CREATED_BY),
('辣椒炒蛋放香肠', '家饭朴老师', 3, '香辣', '荤菜', ARRAY['鸡蛋','香肠'], $CREATED_BY),

-- 凉菜
('菠菜', '家饭朴老师', 3, '清爽', '凉菜', ARRAY['蔬菜','凉拌'], $CREATED_BY),
('黄瓜大头菜', '家饭朴老师', 3, '清爽', '凉菜', ARRAY['黄瓜','大头菜'], $CREATED_BY),
('拌生菜', '家饭朴老师', 3, '清爽', '凉菜', ARRAY['生菜','凉拌'], $CREATED_BY),
('拌黄花', '家饭朴老师', 3, '清爽', '凉菜', ARRAY['黄花菜','凉拌'], $CREATED_BY),
('黄瓜干豆腐', '家饭朴老师', 3, '清爽', '凉菜', ARRAY['黄瓜','豆腐'], $CREATED_BY),

-- 素菜
('苦瓜炒蛋', '家饭朴老师', 3, '清淡', '素菜', ARRAY['苦瓜','鸡蛋'], $CREATED_BY),
('炒豆芽', '家饭朴老师', 3, '清淡', '素菜', ARRAY['豆芽'], $CREATED_BY),
('炒鱼丸', '家饭朴老师', 3, '鲜香', '素菜', ARRAY['鱼丸'], $CREATED_BY),
('炒蘑菇', '家饭朴老师', 3, '鲜香', '素菜', ARRAY['蘑菇'], $CREATED_BY),
('西红柿鸡蛋', '家饭朴老师', 4, '酸甜', '素菜', ARRAY['西红柿','鸡蛋','经典'], $CREATED_BY),
('烫西兰花', '家饭朴老师', 3, '清淡', '素菜', ARRAY['西兰花','健康'], $CREATED_BY),
('芹菜辣椒', '家饭朴老师', 3, '香辣', '素菜', ARRAY['芹菜','辣椒'], $CREATED_BY),
('锅包豆腐', '家饭朴老师', 4, '酸甜', '素菜', ARRAY['豆腐','锅包'], $CREATED_BY),
('葱爆豆腐', '家饭朴老师', 3, '咸香', '素菜', ARRAY['豆腐','葱'], $CREATED_BY),
('辣拌土豆丝', '家饭朴老师', 3, '香辣', '素菜', ARRAY['土豆','辣'], $CREATED_BY),
('金燕土豆片', '家饭朴老师', 3, '咸香', '素菜', ARRAY['土豆'], $CREATED_BY),
('辣白菜土豆片', '家饭朴老师', 3, '酸辣', '素菜', ARRAY['土豆','辣白菜'], $CREATED_BY),
('爆炒大头菜', '家饭朴老师', 3, '咸香', '素菜', ARRAY['大头菜'], $CREATED_BY),
('醋溜白菜', '家饭朴老师', 3, '酸香', '素菜', ARRAY['白菜','醋溜'], $CREATED_BY),
('咖喱菜椒滑蛋', '家饭朴老师', 4, '咖喱', '素菜', ARRAY['咖喱','鸡蛋'], $CREATED_BY),
('油泼豆腐', '家饭朴老师', 3, '香辣', '素菜', ARRAY['豆腐','油泼'], $CREATED_BY),
('나물복음', '家饭朴老师', 3, '清淡', '素菜', ARRAY['韩式','拌菜'], $CREATED_BY),

-- 汤
('豆腐汤', '家饭朴老师', 4, '鲜香', '汤', ARRAY['豆腐','汤'], $CREATED_BY),
('大酱汤', '家饭朴老师', 4, '酱香', '汤', ARRAY['大酱','韩式'], $CREATED_BY),
('豆芽汤', '家饭朴老师', 3, '清淡', '汤', ARRAY['豆芽','汤'], $CREATED_BY),
('酸汤肥牛', '家饭朴老师', 5, '酸辣', '汤', ARRAY['肥牛','酸汤'], $CREATED_BY),

-- 下饭菜
('장조림', '家饭朴老师', 4, '咸香', '下饭菜', ARRAY['韩式','酱肉'], $CREATED_BY),
('콩장', '家饭朴老师', 3, '酱香', '下饭菜', ARRAY['韩式','酱汤'], $CREATED_BY),
('蚬子', '家饭朴老师', 4, '鲜香', '下饭菜', ARRAY['蚬子','海鲜'], $CREATED_BY),

-- 主食
('炒米粉', '家饭朴老师', 4, '咸香', '主食', ARRAY['米粉','炒'], $CREATED_BY),
('金燕咖喱牛肉粉', '家饭朴老师', 4, '咖喱', '主食', ARRAY['咖喱','牛肉','米粉'], $CREATED_BY),

-- 减脂餐
('鸡蛋豆腐虾仁减脂餐', '家饭朴老师', 4, '清淡', '减脂餐', ARRAY['减脂','健康','虾仁'], $CREATED_BY)
ON CONFLICT DO NOTHING;
EOF

unset PGPASSWORD

echo "✓ 美食数据插入完成 (共 46 条)"
echo ""
echo "分类统计:"
echo "  荤菜: 22 | 凉菜: 5 | 素菜: 17"
echo "  汤: 4 | 下饭菜: 3 | 主食: 2 | 减脂餐: 1"
