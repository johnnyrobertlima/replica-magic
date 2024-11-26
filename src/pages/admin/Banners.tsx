import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Banner } from "@/types/oni-site";

export const Banners = () => {
  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oni_site.banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Banner[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Banner
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners?.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>{banner.title}</TableCell>
                <TableCell>{banner.media_type}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      banner.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {banner.is_active ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
