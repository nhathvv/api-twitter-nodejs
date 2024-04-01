import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json(omit(err, ['status']))
}
export default defaultErrorHandler
