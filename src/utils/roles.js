export const isSuperAdmin = (usr) => {
  const code = usr?.role_admin?.code || usr?.role?.code;
  return typeof code === 'string' && code.toUpperCase() === 'SUPER_ADMIN';
};

export const isEditor = (usr) => {
  const code = usr?.role_admin?.code || usr?.role?.code;
  return typeof code === 'string' && code.toUpperCase() === 'EDITOR';
};
