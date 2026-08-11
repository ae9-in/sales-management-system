export function getSalePointScope(user) {
  if (!user || user.role === "admin") {
    return {
      isScoped: false,
      salePointId: null,
      sqlWhere: (existingWhere = "") => (existingWhere ? existingWhere : ""),
      args: [],
    };
  }

  const salePointId = user.salePointId || user.area || "Main Office";

  return {
    isScoped: true,
    salePointId,
    sqlWhere: (existingWhere = "") => {
      if (existingWhere.trim().toUpperCase().startsWith("WHERE")) {
        return `${existingWhere} AND (salePointId = ? OR area = ?)`;
      } else if (existingWhere.trim()) {
        return `WHERE ${existingWhere} AND (salePointId = ? OR area = ?)`;
      }
      return "WHERE (salePointId = ? OR area = ?)";
    },
    args: [salePointId, salePointId],
  };
}
