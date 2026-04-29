-- Migrate existing manager role -> ceo
UPDATE public.user_roles SET role = 'ceo' WHERE role = 'manager';

-- Helper: get a user's department
CREATE OR REPLACE FUNCTION public.get_user_department(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM public.profiles WHERE id = _user_id
$$;

-- ============ DEPARTMENTS RLS ============
CREATE POLICY "Authenticated read departments"
  ON public.departments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "CEO manages departments"
  ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'ceo'));

-- ============ PROFILES: replace manager-era policies ============
DROP POLICY IF EXISTS "Managers update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers view all profiles" ON public.profiles;

CREATE POLICY "CEO views all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "CEO updates all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "Dept head views same-department profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head')
    AND department_id IS NOT NULL
    AND department_id = public.get_user_department(auth.uid())
  );

CREATE POLICY "Dept head updates same-department profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head')
    AND department_id IS NOT NULL
    AND department_id = public.get_user_department(auth.uid())
  );

CREATE POLICY "Accountant views all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'accountant'));

-- ============ TRANSACTIONS: replace manager-era policies ============
DROP POLICY IF EXISTS "Accountants and managers insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Accountants and managers update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Accountants and managers view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers delete transactions" ON public.transactions;

CREATE POLICY "CEO + accountant view all transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'ceo') OR public.has_role(auth.uid(), 'accountant'));

CREATE POLICY "CEO + accountant insert transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'ceo') OR public.has_role(auth.uid(), 'accountant'));

CREATE POLICY "CEO + accountant update transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'ceo') OR public.has_role(auth.uid(), 'accountant'));

CREATE POLICY "CEO deletes transactions"
  ON public.transactions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "Dept head views same-department transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head')
    AND sales_rep_id IS NOT NULL
    AND public.get_user_department(sales_rep_id) IS NOT NULL
    AND public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  );

CREATE POLICY "Dept head inserts transactions in own department"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'dept_head')
    AND sales_rep_id IS NOT NULL
    AND public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  );

CREATE POLICY "Dept head updates same-department transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head')
    AND sales_rep_id IS NOT NULL
    AND public.get_user_department(sales_rep_id) = public.get_user_department(auth.uid())
  );

-- ============ USER_ROLES: replace manager-era policies ============
DROP POLICY IF EXISTS "Managers manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers view all roles" ON public.user_roles;

CREATE POLICY "CEO manages roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "CEO views all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "Dept head views same-department roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head')
    AND public.get_user_department(user_id) = public.get_user_department(auth.uid())
  );