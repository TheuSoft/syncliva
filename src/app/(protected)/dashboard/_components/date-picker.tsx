"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

dayjs.locale("pt-br");

export function DatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();

  // Usar dayjs para maior consistência com o resto da aplicação
  const currentDate = dayjs();
  const defaultFrom = currentDate.startOf("month").format("YYYY-MM-DD");

  const [from] = useQueryState("from", {
    defaultValue: defaultFrom,
  });

  // Estado para o mês/ano selecionado baseado na data from
  const [selectedDate, setSelectedDate] = useState(() => {
    if (from) {
      const dateFromUrl = dayjs(from);
      if (dateFromUrl.isValid()) {
        return dateFromUrl;
      }
    }
    return currentDate;
  });

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const currentYear = dayjs().year();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleMonthYearChange = (month: number, year: number) => {
    const newDate = dayjs().year(year).month(month);
    const startDate = newDate.startOf("month").format("YYYY-MM-DD");
    const endDate = newDate.endOf("month").format("YYYY-MM-DD");

    setSelectedDate(newDate);

    // Usar navegação forçada para recarregar os dados do servidor
    const newUrl = `/dashboard?from=${startDate}&to=${endDate}`;
    router.push(newUrl);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const currentMonth = selectedDate.month();
    const currentYear = selectedDate.year();

    if (direction === "prev") {
      if (currentMonth === 0) {
        handleMonthYearChange(11, currentYear - 1);
      } else {
        handleMonthYearChange(currentMonth - 1, currentYear);
      }
    } else {
      if (currentMonth === 11) {
        handleMonthYearChange(0, currentYear + 1);
      } else {
        handleMonthYearChange(currentMonth + 1, currentYear);
      }
    }
  };

  const formatDisplayDate = () => {
    return selectedDate.format("MMMM [de] YYYY");
  };
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "min-w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Select
                  value={selectedDate.month().toString()}
                  onValueChange={(value) =>
                    handleMonthYearChange(parseInt(value), selectedDate.year())
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDate.year().toString()}
                  onValueChange={(value) =>
                    handleMonthYearChange(selectedDate.month(), parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-muted-foreground text-center text-sm">
              Visualizando dados de {formatDisplayDate()}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
