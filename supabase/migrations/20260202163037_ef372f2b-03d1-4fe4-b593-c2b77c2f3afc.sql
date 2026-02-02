-- Create a trigger function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    phone,
    profile_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'etec')
  );
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger function to automatically assign role when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_type_val text;
  role_val app_role;
BEGIN
  -- Get profile type from metadata
  profile_type_val := COALESCE(NEW.raw_user_meta_data->>'profile_type', 'etec');
  
  -- Map profile type to role
  role_val := CASE profile_type_val
    WHEN 'professor' THEN 'teacher'::app_role
    ELSE 'student'::app_role
  END;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_val);
  
  RETURN NEW;
END;
$$;

-- Create trigger for role assignment
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();