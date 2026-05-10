-- =========================================
-- 0012_seed_points.sql
-- ポイント獲得ルール + 報酬カタログ の初期データ
--
-- 配管工事業向けにアレンジ:
--   - 出来高: REPORT3 の hours から自動付与(将来 pg_cron で日次バッチ)
--   - 安全: ヒヤリハット未発生連続日数(safety combo)
--   - 称号: P3-B 実装後に連動
--   - 日報: 連続提出
--   - リーダー: 班月間目標達成
--   - KY活動: 朝礼チェックリスト完了
-- =========================================

-- 既存テナント (さくら株式会社) の id を取得
do $$
declare
  v_tenant uuid;
begin
  select id into v_tenant from public.tenants where name = 'さくら株式会社' limit 1;
  if v_tenant is null then
    raise notice 'tenant さくら株式会社 not found, skipping seed';
    return;
  end if;

  -- ============ point_rules ============
  insert into public.point_rules
    (tenant_id, category, display_name, description, amount_per_unit, unit, monthly_cap, is_active, display_order)
  values
    (v_tenant, '出来高', '出来高達成ボーナス', '日報入力で記録された作業時間 1 時間ごとに付与', 10, 'h', 2000, true, 1),
    (v_tenant, '安全', '安全コンボボーナス', '無事故連続日数 × 付与pt(日次バッチ)', 5, '日', 500, true, 2),
    (v_tenant, '称号', '称号獲得ボーナス', '称号獲得時にレアリティ別で一括付与', 100, '回', null, true, 3),
    (v_tenant, '日報', '日報連続提出ボーナス', '連続 20 日提出で特別ボーナス', 100, '20日', 300, true, 4),
    (v_tenant, 'リーダー', 'リーダー手当', '班全体の月間目標達成時にリーダーへ付与', 300, '月', 300, true, 5),
    (v_tenant, 'KY活動', 'KY活動完了ボーナス', 'KYチェックリスト全項目完了時に付与', 15, '回', 450, true, 6)
  on conflict (tenant_id, category) do nothing;

  -- ============ rewards ============
  insert into public.rewards
    (tenant_id, name, icon, cost_points, description, is_rare, is_active, display_order)
  values
    (v_tenant, 'カフェギフトカード 500円', '☕', 200, 'スターバックス等で利用可能', false, true, 10),
    (v_tenant, '有給休暇 0.5日', '🎟️', 1000, '半休として取得可能(別途申請要)', false, true, 20),
    (v_tenant, 'Amazonギフトカード 3,000円', '🛍️', 1500, 'お好きなお買い物に', false, true, 30),
    (v_tenant, '工具メンテナンス権', '🔧', 800, '会社負担で工具をメーカーメンテに出せる', false, true, 40),
    (v_tenant, '社長とランチ権', '👑', 5000, 'レア報酬。社長と直接対話できる権利', true, true, 100),
    (v_tenant, '安全装備カスタマイズ枠', '🦺', 3000, 'お気に入りの安全装備を会社負担で支給', true, true, 110)
  on conflict do nothing;
end $$;
