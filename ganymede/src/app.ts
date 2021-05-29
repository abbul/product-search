import 'reflect-metadata'
// eslint-disable-next-line no-unused-vars
import express, { Request, Response, NextFunction, Application } from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { logFile, skipSuccess } from './util/logger'
import { Routes } from './routes'
require('dotenv').config({ path: '.env' })
const { PORT } = process.env

const app: Application = express()
mongoose.connect(process.env.URL_DB || '', { dbName: 'jupiter_app', useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(() => {
  app.use(express.urlencoded({ extended: false }))
  app.use(express.json({}))
  app.use(morgan('combined', { stream: logFile, skip: skipSuccess }))

  Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
      const result = (new (route.controller as any)())[route.action](req, res, next)
      if (result instanceof Promise) {
        result.then(result => result !== null && result !== undefined ? res.status(result.status).send(result) : undefined)
      } else if (result !== null && result !== undefined) {
        res.json(result)
      }
    })
  })
  const server = app.listen(PORT, function () { console.info(`Listening... in port ${PORT}`) })
}).catch((error: any) => console.error('Error MONGO_DB :>> ', error.message))

export default app
