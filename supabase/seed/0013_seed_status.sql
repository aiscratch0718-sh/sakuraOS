-- =========================================
-- 0013_seed_status.sql
-- 称号 + 特殊能力 の初期データ
--
-- 配管工事業向けにアレンジ。デモ v4.0 の称号一覧をベースに B2B 業務寄りに調整。
-- =========================================

do $$
declare
  v_tenant uuid;
begin
  select id into v_tenant from public.tenants where name = 'さくら株式会社' limit 1;
  if v_tenant is null then
    raise notice 'tenant さくら株式会社 not found, skipping seed';
    return;
  end if;

  -- ============ 称号 (12件) ============
  insert into public.title_definitions
    (tenant_id, code, display_name, icon, description, rarity, unlock_condition, reward_points, is_active)
  values
    -- gold (希少・実績重視)
    (v_tenant, 'rescue_master',         '現場復旧の神',     '🔥', 'トラブル解決速度 全社No.1 を 3 回連続達成', 'gold',     'incident_responses 全社1位 ×3 連続', 200, true),
    (v_tenant, 'safety_guardian',       '安全の番人',       '🛡️', '無事故コンボ 180 日以上を継続',             'gold',     'safety_combo_days >= 180',           200, true),
    (v_tenant, 'speedstar',             'スピードスター',   '⚡', '月間出来高が目標の 150% を達成',            'gold',     '月間出来高達成率 >= 150%',           150, true),
    (v_tenant, 'iron_wall',             '鉄壁の守護者',     '🦾', '安全管理スキル Lv.90 到達',                 'gold',     'skill_parameters.safety >= 90',      150, true),
    -- silver (中堅・実務貢献)
    (v_tenant, 'communicator',          'コミュニケーター', '🗣️', '日報の質と頻度で部内 3 ヶ月連続 No.1',      'silver',   'communication 全社2位以内 ×3ヶ月',   100, true),
    (v_tenant, 'mentor',                '頼れる先輩',       '🧑‍🏫', '若手 1 名以上を OJT で半年以上指導',        'silver',   '管理者承認による手動付与',           100, true),
    (v_tenant, 'ky_champion',           'KY マスター',      '🛡️', 'KY 活動 100 回完了',                        'silver',   'safety_checks.count >= 100',         100, true),
    (v_tenant, 'paper_master',          '書類の達人',       '📋', '安全書類提出ミス 0 を半年継続',             'silver',    '管理者承認による手動付与',          100, true),
    -- bronze (新人・歩み)
    (v_tenant, 'first_hands',           '初仕事完遂',       '✊', '初めての日報を提出',                        'bronze',   '初回 report3_entries.submitted',     50,  true),
    (v_tenant, 'thirty_days',           '皆勤 30 日',       '📅', '出勤率 100% を 30 日間維持',                 'bronze',   '勤怠データ要算出',                   50,  true),
    (v_tenant, 'photo_reporter',        '記録の人',         '📷', '日報写真を 50 件以上添付',                  'bronze',   'work_photos.count(per user) >= 50',  50,  true),
    -- platinum (伝説級)
    (v_tenant, 'legend_construction',   'レジェンド施工',    '👑', '生涯出来高 全社累計 1 万 ㎡ 達成',          'platinum', 'work_logs lifetime sum >= 10000㎡',  500, true)
  on conflict (tenant_id, code) do nothing;

  -- ============ 特殊能力 (8件) ============
  insert into public.special_abilities
    (tenant_id, code, display_name, icon, description, rarity)
  values
    -- gold
    (v_tenant, 'critical_hit',     'クリティカルヒット', '⚡', '一日で目標の 200% を達成', 'gold'),
    (v_tenant, 'composure',        '冷静沈着',           '🧊', '緊急対応で適切な判断ができる', 'gold'),
    -- silver
    (v_tenant, 'inspiration',      '閃き',               '💡', '改善提案を月 3 件以上採用される', 'silver'),
    (v_tenant, 'morale_boost',     '鼓舞',               '🎌', '班全体の士気を高める存在', 'silver'),
    (v_tenant, 'multitasker',      '多面作業',           '🌀', '複数現場を同時にカバーできる', 'silver'),
    -- bronze
    (v_tenant, 'persistence',      '不屈',               '💪', '困難な作業を諦めず完遂する', 'bronze'),
    (v_tenant, 'punctual',         '時間厳守',           '⏰', '遅刻ゼロを維持', 'bronze'),
    (v_tenant, 'tidy',             '整理整頓',           '🧹', '工具・現場の整理が行き届いている', 'bronze')
  on conflict (tenant_id, code) do nothing;
end $$;
