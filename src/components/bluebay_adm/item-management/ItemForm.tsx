
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFormProps {
  item: any | null;
  onSave: (item: any) => Promise<void>;
  groups: any[];
  subcategories: any[];
  brands: any[];
}

export const ItemForm = ({ 
  item, 
  onSave, 
  groups, 
  subcategories = [],
  brands = []
}: ItemFormProps) => {
  const [formData, setFormData] = useState({
    ITEM_CODIGO: "",
    DESCRICAO: "",
    GRU_CODIGO: "",
    GRU_DESCRICAO: "",
    CODIGOAUX: "",
    id_subcategoria: "",
    id_marca: "",
    empresa: "",
    estacao: "",
    genero: "",
    faixa_etaria: "",
    ativo: true,
    ncm: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (item) {
      setFormData({
        ITEM_CODIGO: item.ITEM_CODIGO || "",
        DESCRICAO: item.DESCRICAO || "",
        GRU_CODIGO: item.GRU_CODIGO || "",
        GRU_DESCRICAO: item.GRU_DESCRICAO || "",
        CODIGOAUX: item.CODIGOAUX || "",
        id_subcategoria: item.id_subcategoria || "",
        id_marca: item.id_marca || "",
        empresa: item.empresa || "",
        estacao: item.estacao || "",
        genero: item.genero || "",
        faixa_etaria: item.faixa_etaria || "",
        ativo: item.ativo !== false, // default to true if undefined
        ncm: item.ncm || "",
      });
    } else {
      setFormData({
        ITEM_CODIGO: "",
        DESCRICAO: "",
        GRU_CODIGO: "",
        GRU_DESCRICAO: "",
        CODIGOAUX: "",
        id_subcategoria: "",
        id_marca: "",
        empresa: "",
        estacao: "",
        genero: "",
        faixa_etaria: "",
        ativo: true,
        ncm: "",
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === "GRU_CODIGO") {
      const selectedGroup = groups.find((g) => g.GRU_CODIGO === value);
      if (selectedGroup) {
        setFormData((prev) => ({
          ...prev,
          GRU_CODIGO: value,
          GRU_DESCRICAO: selectedGroup.GRU_DESCRICAO,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          GRU_CODIGO: value,
          GRU_DESCRICAO: "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs 
        defaultValue="basic" 
        className="w-full" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="additional">Detalhes Adicionais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ITEM_CODIGO">Código do Item</Label>
              <Input
                id="ITEM_CODIGO"
                name="ITEM_CODIGO"
                value={formData.ITEM_CODIGO}
                onChange={handleChange}
                placeholder="Código do item"
                required
                readOnly={!!item} // Only allow editing code for new items
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="CODIGOAUX">Código Auxiliar</Label>
              <Input
                id="CODIGOAUX"
                name="CODIGOAUX"
                value={formData.CODIGOAUX}
                onChange={handleChange}
                placeholder="Código auxiliar (opcional)"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="DESCRICAO">Descrição</Label>
            <Input
              id="DESCRICAO"
              name="DESCRICAO"
              value={formData.DESCRICAO}
              onChange={handleChange}
              placeholder="Descrição do item"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="GRU_CODIGO">Grupo</Label>
              <Select 
                value={formData.GRU_CODIGO} 
                onValueChange={(value) => handleSelectChange("GRU_CODIGO", value)}
              >
                <SelectTrigger id="GRU_CODIGO">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.GRU_CODIGO} value={group.GRU_CODIGO}>
                      {group.GRU_DESCRICAO}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="id_subcategoria">Subcategoria</Label>
              <Select 
                value={formData.id_subcategoria} 
                onValueChange={(value) => handleSelectChange("id_subcategoria", value)}
              >
                <SelectTrigger id="id_subcategoria">
                  <SelectValue placeholder="Selecione uma subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.id}>
                      {subcat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="id_marca">Marca</Label>
              <Select 
                value={formData.id_marca} 
                onValueChange={(value) => handleSelectChange("id_marca", value)}
              >
                <SelectTrigger id="id_marca">
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Empresa"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="additional" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="genero">Gênero</Label>
              <Select 
                value={formData.genero} 
                onValueChange={(value) => handleSelectChange("genero", value)}
              >
                <SelectTrigger id="genero">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Unissex">Unissex</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="faixa_etaria">Faixa Etária</Label>
              <Select 
                value={formData.faixa_etaria} 
                onValueChange={(value) => handleSelectChange("faixa_etaria", value)}
              >
                <SelectTrigger id="faixa_etaria">
                  <SelectValue placeholder="Selecione a faixa etária" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                  <SelectItem value="Juvenil">Juvenil</SelectItem>
                  <SelectItem value="Bebê">Bebê</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="estacao">Estação</Label>
              <Select 
                value={formData.estacao} 
                onValueChange={(value) => handleSelectChange("estacao", value)}
              >
                <SelectTrigger id="estacao">
                  <SelectValue placeholder="Selecione a estação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verão">Verão</SelectItem>
                  <SelectItem value="Inverno">Inverno</SelectItem>
                  <SelectItem value="Outono">Outono</SelectItem>
                  <SelectItem value="Primavera">Primavera</SelectItem>
                  <SelectItem value="Todas">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ncm">NCM</Label>
              <Input
                id="ncm"
                name="ncm"
                value={formData.ncm}
                onChange={handleChange}
                placeholder="Código NCM"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="ativo" 
              checked={formData.ativo}
              onCheckedChange={(checked) => 
                handleCheckboxChange("ativo", checked as boolean)
              }
            />
            <Label htmlFor="ativo" className="cursor-pointer">Item ativo</Label>
          </div>
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
};
