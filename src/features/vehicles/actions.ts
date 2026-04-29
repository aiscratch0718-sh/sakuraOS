"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const VehicleInputSchema = z.object({
  plateNumber: z.string().trim().min(1).max(40),
  model: z.string().trim().max(60).optional().or(z.literal("")),
  status: z
    .enum(["available", "in_use", "maintenance", "retired"])
    .default("available"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

const VehicleRunInputSchema = z.object({
  vehicleId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  distanceKm: z.coerce.number().min(0).max(10000),
  startOdometer: z.coerce.number().int().min(0).max(10_000_000).optional(),
  endOdometer: z.coerce.number().int().min(0).max(10_000_000).optional(),
  alcoholResult: z.enum(["ok", "warning", "ng"]).default("ok"),
  alcoholValue: z.coerce.number().min(0).max(2).optional(),
  abnormal: z.string().trim().max(500).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  startLat: z.coerce.number().optional(),
  startLng: z.coerce.number().optional(),
  endLat: z.coerce.number().optional(),
  endLng: z.coerce.number().optional(),
});

export type VehicleActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

function ensureMaster(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "車両マスタを編集する権限がありません。";
  }
  return null;
}

export async function createVehicle(
  prev: VehicleActionResult,
  formData: FormData,
): Promise<VehicleActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMaster(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = VehicleInputSchema.safeParse({
    plateNumber: formData.get("plateNumber") ?? "",
    model: formData.get("model") ?? "",
    status: formData.get("status") ?? "available",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      tenant_id: session.tenantId,
      plate_number: parsed.data.plateNumber,
      model: parsed.data.model || null,
      status: parsed.data.status,
      note: parsed.data.note || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      formError:
        error?.code === "23505"
          ? "ナンバーが他の車両と重複しています。"
          : (error?.message ?? "保存に失敗しました。"),
    };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "vehicle.created",
    target_type: "vehicle",
    target_id: data.id,
    diff: { plateNumber: parsed.data.plateNumber },
  });

  revalidatePath("/pc/vehicles");
  redirect("/pc/vehicles");
}

export async function createVehicleRun(
  prev: VehicleActionResult,
  formData: FormData,
): Promise<VehicleActionResult> {
  void prev;
  const session = await requireSession();
  const supabase = await createClient();

  const parsed = VehicleRunInputSchema.safeParse({
    vehicleId: formData.get("vehicleId") ?? "",
    projectId: formData.get("projectId") ?? "",
    runDate: formData.get("runDate") ?? "",
    distanceKm: formData.get("distanceKm") ?? "0",
    startOdometer: formData.get("startOdometer") || undefined,
    endOdometer: formData.get("endOdometer") || undefined,
    alcoholResult: formData.get("alcoholResult") ?? "ok",
    alcoholValue: formData.get("alcoholValue") || undefined,
    abnormal: formData.get("abnormal") ?? "",
    note: formData.get("note") ?? "",
    startLat: formData.get("startLat") || undefined,
    startLng: formData.get("startLng") || undefined,
    endLat: formData.get("endLat") || undefined,
    endLng: formData.get("endLng") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("vehicle_runs")
    .insert({
      tenant_id: session.tenantId,
      vehicle_id: parsed.data.vehicleId,
      user_id: session.userId,
      project_id: parsed.data.projectId || null,
      run_date: parsed.data.runDate,
      distance_km: parsed.data.distanceKm,
      start_odometer: parsed.data.startOdometer ?? null,
      end_odometer: parsed.data.endOdometer ?? null,
      alcohol_check_result: parsed.data.alcoholResult,
      alcohol_check_value: parsed.data.alcoholValue ?? null,
      abnormal: parsed.data.abnormal || null,
      note: parsed.data.note || null,
      start_lat: parsed.data.startLat ?? null,
      start_lng: parsed.data.startLng ?? null,
      end_lat: parsed.data.endLat ?? null,
      end_lng: parsed.data.endLng ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, formError: error?.message ?? "保存に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "vehicle_run.created",
    target_type: "vehicle_run",
    target_id: data.id,
    diff: {
      distanceKm: parsed.data.distanceKm,
      alcoholResult: parsed.data.alcoholResult,
    },
  });

  revalidatePath("/sp/vehicle-runs");
  revalidatePath("/pc/vehicle-runs");
  redirect("/sp/vehicle-runs");
}
