// Fallback de declaração para 'pg' caso @types/pg não esteja resolvido imediatamente
// (evita erro de compilação em ambientes sem instalação de dev types).
// Será sobrescrito automaticamente pelos tipos oficiais quando presentes.
declare module 'pg';
