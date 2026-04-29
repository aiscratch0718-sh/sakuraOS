"use client";

import { useState, useEffect } from "react";

export type StampMaster = {
  stamp_key: string;
  display_name: string;
  role_name: string;
  image_path: string;
  is_company_stamp: boolean;
};

/**
 * 印鑑の ON/OFF をチェックボックスで管理する Client Component。
 *
 * 親フォームの hidden field に JSON を出力する(例: `{"company":true,"president":false,...}`)。
 * 印鑑は事前登録された approval_stamps マスタから渡される。
 *
 * 設計原則:
 * - ユーザーは新規アップロードできない(管理者が事前登録した画像のみ)
 * - PDF 出力時、チェックされた印鑑だけが合成される
 * - print_company_stamp / print_staff_info / print_company_contact はトグル UI
 */
export function StampSelector({
  stamps,
  initialSelection = {},
  initialPrintOptions,
  onChangeJson,
  onChangePrintOptions,
}: {
  stamps: StampMaster[];
  initialSelection?: Record<string, boolean>;
  initialPrintOptions?: {
    printCompanyStamp: boolean;
    printStaffInfo: boolean;
    printCompanyContact: boolean;
  };
  onChangeJson?: (json: string) => void;
  onChangePrintOptions?: (opts: {
    printCompanyStamp: boolean;
    printStaffInfo: boolean;
    printCompanyContact: boolean;
  }) => void;
}) {
  const [selection, setSelection] =
    useState<Record<string, boolean>>(initialSelection);
  const [printCompanyStamp, setPrintCompanyStamp] = useState<boolean>(
    initialPrintOptions?.printCompanyStamp ?? true,
  );
  const [printStaffInfo, setPrintStaffInfo] = useState<boolean>(
    initialPrintOptions?.printStaffInfo ?? true,
  );
  const [printCompanyContact, setPrintCompanyContact] = useState<boolean>(
    initialPrintOptions?.printCompanyContact ?? true,
  );

  useEffect(() => {
    onChangeJson?.(JSON.stringify(selection));
  }, [selection, onChangeJson]);

  useEffect(() => {
    onChangePrintOptions?.({
      printCompanyStamp,
      printStaffInfo,
      printCompanyContact,
    });
  }, [
    printCompanyStamp,
    printStaffInfo,
    printCompanyContact,
    onChangePrintOptions,
  ]);

  function toggle(key: string) {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-bold text-ink-2 mb-2">
          印鑑(チェックされた印鑑のみ PDF に表示されます)
        </label>
        {stamps.length === 0 ? (
          <p className="text-[11px] text-ink-3 panel-pad bg-amber-bg/30 border-amber/30">
            印鑑マスタが登録されていません。事務にお問い合わせください。
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {stamps.map((stamp) => {
              const checked = !!selection[stamp.stamp_key];
              return (
                <label
                  key={stamp.stamp_key}
                  className={`flex items-center gap-2 p-2 rounded-btn border-2 cursor-pointer transition-all ${
                    checked
                      ? "border-blue bg-blue-bg/30"
                      : "border-line bg-white hover:border-blue-2/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(stamp.stamp_key)}
                    className="w-4 h-4 accent-blue shrink-0"
                  />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stamp.image_path}
                      alt={stamp.display_name}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                    <div className="text-[12px] font-bold text-ink truncate">
                      {stamp.display_name}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-bold text-ink-2 mb-1">
          印刷オプション
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          <label className="flex items-center gap-2 p-2 rounded-btn bg-graybg cursor-pointer">
            <input
              type="checkbox"
              checked={printCompanyStamp}
              onChange={(e) => setPrintCompanyStamp(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue"
            />
            <span className="font-bold">会社印を印字</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-btn bg-graybg cursor-pointer">
            <input
              type="checkbox"
              checked={printStaffInfo}
              onChange={(e) => setPrintStaffInfo(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue"
            />
            <span className="font-bold">担当者情報を印字</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-btn bg-graybg cursor-pointer">
            <input
              type="checkbox"
              checked={printCompanyContact}
              onChange={(e) => setPrintCompanyContact(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue"
            />
            <span className="font-bold">会社連絡先を印字</span>
          </label>
        </div>
      </div>
    </div>
  );
}
