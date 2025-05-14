"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { profileSchema, ProfileFormValues } from "@/validators/profile";
import { updateProfile } from "@/actions/profile/update";
import { formatDocument } from "@/lib/format-utils";
import { PatternFormat } from "react-number-format";
import { daysOfWeek } from "@/mocked/daysOfWeek";
import { brazilStatesWithTimezones } from "@/mocked/brazilStates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

interface CombinedProfileData extends Partial<User> {
  profile?: Partial<Profile> | null;
}

interface ProfileFormProps {
  initialData?: CombinedProfileData;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const processInitialBusinessHours = () => {
    if (initialData?.profile?.businessHours) {
      if (Array.isArray(initialData.profile.businessHours)) {
        return initialData.profile.businessHours;
      }

      try {
        const parsedHours =
          typeof initialData.profile.businessHours === "string"
            ? JSON.parse(initialData.profile.businessHours)
            : initialData.profile.businessHours;

        return Array.isArray(parsedHours)
          ? parsedHours
          : [{ day: daysOfWeek[0], openTime: "08:00", closeTime: "18:00" }];
      } catch (error) {
        console.error("Erro ao processar horários de funcionamento:", error);
        return [{ day: daysOfWeek[0], openTime: "08:00", closeTime: "18:00" }];
      }
    }
    return [{ day: daysOfWeek[0], openTime: "08:00", closeTime: "18:00" }];
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      whatsapp: initialData?.profile?.whatsapp || "",
      companyName: initialData?.profile?.companyName || "",
      businessHours: processInitialBusinessHours(),
      address: initialData?.profile?.address || "",
      locationUrl: initialData?.profile?.locationUrl || "",
      documentNumber: initialData?.profile?.documentNumber || "",
      timezone: initialData?.profile?.timezone || "",
    },
  });

  const { fields, append, remove } = useFieldArray<ProfileFormValues>({
    control: form.control,
    name: "businessHours",
  });

  const getAvailableDays = (currentIndex: number) => {
    const selectedDays = fields
      .map((field, index) =>
        index !== currentIndex
          ? form.getValues(`businessHours.${index}.day`)
          : ""
      )
      .filter(Boolean);

    return daysOfWeek.filter((day) => !selectedDays.includes(day));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDocument(e.target.value);
    form.setValue("documentNumber", formattedValue);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast.success("Perfil atualizado com sucesso");
        router.push("/profile");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar o perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 max-w-xl mx-auto"
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu sobrenome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Whatsapp da Empresa</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    customInput={Input}
                    placeholder="(00) 00000-0000"
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome da empresa ou profissional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Endereço completo"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationUrl"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Link do Google Maps</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.google.com/maps/..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5 w-full">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Estado (Fuso Horário)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brazilStatesWithTimezones.map((item, index) => (
                        <SelectItem
                          key={`state-${index * Math.random()}`}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      {...field}
                      onChange={(e) => {
                        handleDocumentChange(e);
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Horários de Atendimento</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ day: "", openTime: "09:00", closeTime: "18:00" })
              }
            >
              Adicionar Horário
            </Button>
          </div>

          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`businessHours.${index}.day`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dia da Semana</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="">Selecione um dia</option>
                                {getAvailableDays(index).map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`businessHours.${index}.openTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Abertura</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`businessHours.${index}.closeTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fechamento</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {fields.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="mt-4 w-full"
                          onClick={() => remove(index)}
                        >
                          Remover
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Salvando..." : "Salvar Perfil"}
        </Button>
      </form>
    </Form>
  );
}
