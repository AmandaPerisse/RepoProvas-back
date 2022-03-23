export function validateSchemaMiddleware(schema, resStatus) {
  return (req, res, next) => {
    const validation = schema.validate(req.body);
    if (validation.error) {
      return res.sendStatus(resStatus);
    }

    next();
  }
}