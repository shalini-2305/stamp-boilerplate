import { z } from "zod";

export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as your application grows and you need other validators to share
   with back and frontend, you can put them in here
  `,
);

// Orders

export const OrderProductSpecificationSchema = z.object({
  stampData: z.object({
    currDesign: z.string(),
    arabicName: z.string(),
    englishName: z.string(),
    licenseNo: z.string().optional(),
    locationText: z.string().optional(),
    locationArabicText: z.string().optional(),
    postalCode: z.string().optional(),
    motto: z.string().optional(),
    phoneNo: z.string().optional(),
    size: z.string(),
    shape: z.string(),
    color: z.string(),
  }),
});

export const OrderProductsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    qty: z.number(),
    productType: z.enum(["physical", "digital"]),
    specification: OrderProductSpecificationSchema,
    uploadedIcon: z.string().optional(),
  }),
);

// Auth schemas
export const SigninSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_address: z.string().optional(),
  type: z.literal("credentials"),
});
