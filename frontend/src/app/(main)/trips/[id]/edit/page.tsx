"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    AlignLeft,
    ArrowLeft,
    DollarSign,
    Loader2,
    Save,
    Type,
    Users,
} from "lucide-react";

import { TripDestinationPicker } from "@/components/trip/TripDestinationPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    formatCurrencyInput,
    getTomorrowDateInputValue,
    normalizePositiveIntegerInput,
    parseCurrencyInput,
    parsePositiveIntegerInput,
} from "@/lib/trip-format";
import {
    formatTripDestination,
    OTHER_DESTINATION_OPTION,
    parseTripDestination,
    resolveTripDestinationPlace,
} from "@/lib/vietnam-destinations";
import { setAuthFlash } from "@/services/auth";
import { ApiError } from "@/services/fetchWrapper";
import { getTrip, updateTrip } from "@/services/trips";

const editTripSchema = z.object({
    title: z.string().min(10, { message: "Tên chuyến đi cần ít nhất 10 ký tự" }),
    province: z.string().min(2, { message: "Vui lòng chọn tỉnh/thành phố" }),
    destinationPlace: z.string().min(2, { message: "Vui lòng chọn điểm đến cụ thể" }),
    customDestination: z.string().optional(),
    budget: z.string()
        .min(1, { message: "Vui lòng nhập ngân sách" })
        .refine((value) => {
            const amount = parseCurrencyInput(value);
            return amount !== null && amount > 0;
        }, { message: "Ngân sách phải lớn hơn 0" }),
    maxMembers: z.string()
        .min(1, { message: "Vui lòng nhập số lượng thành viên" })
        .regex(/^\d+$/, { message: "Số lượng thành viên không hợp lệ" })
        .refine((value) => Number(value) >= 2, { message: "Nhóm cần ít nhất 2 người" })
        .refine((value) => Number(value) <= 20, { message: "Tối đa 20 người" }),
    description: z.string().min(20, { message: "Mô tả cần chi tiết hơn (ít nhất 20 ký tự)" }),
    startDate: z.string().min(1, { message: "Vui lòng chọn ngày đi" }),
    endDate: z.string().min(1, { message: "Vui lòng chọn ngày về" }),
}).refine((data) => data.startDate >= getTomorrowDateInputValue(), {
    message: "Ngày đi phải từ ngày mai trở đi",
    path: ["startDate"],
}).refine((data) => data.endDate >= data.startDate, {
    message: "Ngày về phải bằng hoặc sau ngày đi",
    path: ["endDate"],
}).refine((data) => {
    if (data.destinationPlace !== OTHER_DESTINATION_OPTION) return true;

    return (data.customDestination ?? "").trim().length >= 2;
}, {
    message: "Vui lòng nhập điểm đến khác",
    path: ["customDestination"],
});

type EditTripFormValues = z.infer<typeof editTripSchema>;

export default function EditTripPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [formError, setFormError] = useState("");
    const minTripDate = getTomorrowDateInputValue();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        clearErrors,
        control,
        formState: { errors, isSubmitting },
    } = useForm<EditTripFormValues>({
        resolver: zodResolver(editTripSchema),
        defaultValues: {
            title: "",
            province: "",
            destinationPlace: "",
            customDestination: "",
            budget: "",
            maxMembers: "",
            description: "",
            startDate: "",
            endDate: "",
        },
    });
    const selectedStartDate = useWatch({ control, name: "startDate" });
    const selectedProvince = useWatch({ control, name: "province" });
    const selectedDestinationPlace = useWatch({ control, name: "destinationPlace" });
    const customDestination = useWatch({ control, name: "customDestination" }) ?? "";

    useEffect(() => {
        let isActive = true;

        async function loadTrip() {
            setIsLoading(true);
            setFormError("");

            try {
                const trip = await getTrip(params.id);
                if (!isActive) return;

                const { title, body } = splitTripDescription(
                    trip.description,
                    formatTripDestination(trip.destination, trip.destinationPlace),
                );
                const parsedDestination = parseTripDestination(
                    trip.destination,
                    trip.destinationPlace,
                );

                reset({
                    title,
                    province: parsedDestination.province,
                    destinationPlace: parsedDestination.destinationPlace,
                    customDestination: parsedDestination.customDestination,
                    budget: formatCurrencyInput(String(Math.round(trip.budget ?? 0))),
                    maxMembers: String(trip.maxMembers),
                    description: body || trip.description || "",
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                });
            } catch (loadError) {
                if (!isActive) return;

                setFormError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Không thể tải thông tin chuyến đi.",
                );
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        if (params.id) {
            void loadTrip();
        }

        return () => {
            isActive = false;
        };
    }, [params.id, reset]);

    const onSubmit = async (data: EditTripFormValues) => {
        setFormError("");

        const budget = parseCurrencyInput(data.budget);
        const maxMembers = parsePositiveIntegerInput(data.maxMembers);

        if (!budget || !maxMembers) {
            setFormError("Vui lòng kiểm tra lại ngân sách và số lượng thành viên.");
            return;
        }

        try {
            const destinationPlace = resolveTripDestinationPlace(
                data.destinationPlace,
                data.customDestination,
            );

            await updateTrip(params.id, {
                destination: data.province.trim(),
                destinationPlace,
                startDate: data.startDate,
                endDate: data.endDate,
                budget,
                maxMembers,
                description: `${data.title.trim()}\n\n${data.description.trim()}`,
            });

            setAuthFlash("Cập nhật chuyến đi thành công.");
            router.push(`/trips/manage?tab=created&tripId=${params.id}`);
            router.refresh();
        } catch (submitError) {
            if (submitError instanceof ApiError && submitError.status === 401) {
                router.replace("/login");
                return;
            }

            setFormError(
                submitError instanceof Error
                    ? submitError.message
                    : "Không thể cập nhật chuyến đi.",
            );
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto flex justify-center px-4 py-16 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải thông tin chuyến đi...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container mx-auto max-w-3xl px-4">
                <Button
                    type="button"
                    variant="ghost"
                    className="mb-4 text-slate-600 hover:text-blue-600"
                    onClick={() => router.push(`/trips/manage?tab=created&tripId=${params.id}`)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại quản lý
                </Button>

                <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
                    <CardHeader className="border-b bg-slate-900 px-8 py-7 text-white">
                        <CardTitle className="flex items-center gap-3 text-2xl font-extrabold">
                            <Save className="h-6 w-6 text-blue-300" />
                            Chỉnh sửa chuyến đi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FieldError message={formError} />

                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-semibold text-slate-700">
                                    Tên chuyến đi
                                </Label>
                                <div className="relative">
                                    <Type className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <Input id="title" className={`h-12 pl-11 ${errors.title ? "border-red-500" : ""}`} {...register("title")} />
                                </div>
                                <FieldError message={errors.title?.message} />
                            </div>

                            <TripDestinationPicker
                                province={selectedProvince}
                                destinationPlace={selectedDestinationPlace}
                                customDestination={customDestination}
                                provinceError={errors.province?.message}
                                destinationPlaceError={errors.destinationPlace?.message}
                                customDestinationError={errors.customDestination?.message}
                                onProvinceChange={(province) => {
                                    setValue("province", province, { shouldDirty: true, shouldValidate: true });
                                    setValue("destinationPlace", "", { shouldDirty: true });
                                    setValue("customDestination", "", { shouldDirty: true });
                                    clearErrors(["destinationPlace", "customDestination"]);
                                }}
                                onDestinationPlaceChange={(destinationPlace) => {
                                    setValue("destinationPlace", destinationPlace, { shouldDirty: true, shouldValidate: true });
                                    if (destinationPlace !== OTHER_DESTINATION_OPTION) {
                                        setValue("customDestination", "", { shouldDirty: true });
                                        clearErrors("customDestination");
                                    }
                                }}
                                onCustomDestinationChange={(value) => {
                                    setValue("customDestination", value, { shouldDirty: true, shouldValidate: true });
                                }}
                            />

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="font-semibold text-slate-700">
                                        Ngày đi
                                    </Label>
                                    <Input id="startDate" type="date" min={minTripDate} className={`h-12 ${errors.startDate ? "border-red-500" : ""}`} {...register("startDate")} />
                                    <FieldError message={errors.startDate?.message} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="font-semibold text-slate-700">
                                        Ngày về
                                    </Label>
                                    <Input id="endDate" type="date" min={selectedStartDate || minTripDate} className={`h-12 ${errors.endDate ? "border-red-500" : ""}`} {...register("endDate")} />
                                    <FieldError message={errors.endDate?.message} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="budget" className="font-semibold text-slate-700">
                                        Ngân sách dự kiến
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="budget"
                                            inputMode="numeric"
                                            className={`h-12 pl-11 pr-14 ${errors.budget ? "border-red-500" : ""}`}
                                            {...register("budget", {
                                                onChange: (event) => {
                                                    event.target.value = formatCurrencyInput(event.target.value);
                                                },
                                            })}
                                        />
                                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                            VNĐ
                                        </span>
                                    </div>
                                    <FieldError message={errors.budget?.message} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxMembers" className="font-semibold text-slate-700">
                                        Thành viên tối đa
                                    </Label>
                                    <div className="relative">
                                        <Users className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="maxMembers"
                                            inputMode="numeric"
                                            className={`h-12 pl-11 ${errors.maxMembers ? "border-red-500" : ""}`}
                                            {...register("maxMembers", {
                                                onChange: (event) => {
                                                    event.target.value = normalizePositiveIntegerInput(event.target.value);
                                                },
                                            })}
                                        />
                                    </div>
                                    <FieldError message={errors.maxMembers?.message} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-semibold text-slate-700">
                                    Mô tả chi tiết
                                </Label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3.5 top-4 h-5 w-5 text-slate-400" />
                                    <Textarea id="description" className={`min-h-[150px] py-4 pl-11 ${errors.description ? "border-red-500" : ""}`} {...register("description")} />
                                </div>
                                <FieldError message={errors.description?.message} />
                            </div>

                            <Button type="submit" className="h-12 w-full bg-blue-600 font-bold hover:bg-blue-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang lưu...</>
                                ) : (
                                    <><Save className="mr-2 h-5 w-5" /> Lưu thay đổi</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {message}
        </p>
    );
}

function splitTripDescription(description: string | null, destination: string) {
    const parts = (description ?? "")
        .split(/\n+/)
        .map((part) => part.trim())
        .filter(Boolean);

    return {
        title: parts[0] || `Chuyến đi ${destination}`,
        body: parts.slice(1).join("\n\n"),
    };
}
