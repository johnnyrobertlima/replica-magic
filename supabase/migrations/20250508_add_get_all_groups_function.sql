
-- Criação de uma função RPC para obter todos os grupos
-- Esta função contorna as políticas RLS para a tabela de grupos
CREATE OR REPLACE FUNCTION public.get_all_groups()
RETURNS SETOF public.groups
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é um administrador
  IF EXISTS (
    SELECT 1 
    FROM user_groups ug
    JOIN group_permissions gp ON ug.group_id = gp.group_id
    WHERE ug.user_id = auth.uid() 
    AND gp.permission_type = 'admin'
    AND gp.resource_path = '/admin'
    LIMIT 1
  ) THEN
    -- Se for administrador, retornar todos os grupos
    RETURN QUERY SELECT * FROM public.groups ORDER BY name;
  ELSE
    -- Se não for administrador, não retorna nada
    RETURN;
  END IF;
END;
$$;

-- Conceder permissões para que a função seja executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_all_groups() TO authenticated;

-- Configurar permissão para que apenas admins possam ver os resultados da função
REVOKE ALL ON FUNCTION public.get_all_groups() FROM public;

-- Extender a função check_admin_permission existente para aceitar um parâmetro específico para o caminho
CREATE OR REPLACE FUNCTION public.is_admin_for_path(check_user_id uuid, path text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_groups ug
        JOIN public.group_permissions gp ON ug.group_id = gp.group_id
        WHERE ug.user_id = check_user_id
        AND gp.permission_type = 'admin'
        AND gp.resource_path = path
    );
END;
$$;

-- Conceder permissões para que a função seja executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.is_admin_for_path(uuid, text) TO authenticated;

-- Revoque permissões públicas
REVOKE ALL ON FUNCTION public.is_admin_for_path(uuid, text) FROM public;
