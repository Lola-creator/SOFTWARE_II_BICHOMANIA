const aBase64Url = (objeto) => Buffer.from(JSON.stringify(objeto)).toString("base64url");

const ahoraEnSegundos = () => Math.floor(Date.now() / 1000);

export const crearToken = (datos, { exp = ahoraEnSegundos() + 3600 } = {}) =>
  `${aBase64Url({ alg: "HS256", typ: "JWT" })}.${aBase64Url({ ...datos, exp })}.firma`;

export const crearTokenExpirado = (datos) => crearToken(datos, { exp: ahoraEnSegundos() - 60 });
