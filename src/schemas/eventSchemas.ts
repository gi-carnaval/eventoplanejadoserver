import { z } from "zod";

export const eventSchema = z.object({
  eventData: z.object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    }),
    description: z.string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string"
    }),
    startDateTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid start date time",
    }),
    endDateTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid end date time",
    }),
    address: z.string({
      required_error: "Address is required",
      invalid_type_error: "Address must be a string"
    }),
  }),
  userId: z.string({
    required_error: "UserId is required",
    invalid_type_error: "UserId must be a string"
  })
})