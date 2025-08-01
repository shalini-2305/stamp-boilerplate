import { relations, sql } from "drizzle-orm";
import {
  pgEnum,
  pgSchema,
  pgTable,
  uuid,
} from "drizzle-orm/pg-core";


// TODO: add indexes
const Auth = pgSchema("auth");
const Users = Auth.table("users", {
  id: uuid("id").primaryKey(),
});

// NOTE: `export` creates table...
// address_type = billing or shipping
export const addressTypeEnumValues = ["billing", "shipping"] as const;
export const addressTypeEnum = pgEnum(
  "address_type_enum",
  addressTypeEnumValues,
);
export const Addresses = pgTable("addresses", (t) => ({
  // id, user_id, address_type, name, address, city, state, country, zipcode, created_at
  id: t
    .uuid()
    .notNull()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: t
    .uuid()
    .notNull()
    .references(() => Users.id),
  zipcode: t.text("zipcode").notNull(),
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}));

export const Products = pgTable("products", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar("name").notNull(),
  price: t.real("price").notNull(),
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}));

// TODO: product details specification json should be validated when adding new product
// Product details with relations
// export const ProductDetails = pgTable("product_details", (t) => ({
//   id: t
//     .uuid()
//     .notNull()
//     .primaryKey()
//     .default(sql`gen_random_uuid()`),
//   productId: t
//     .uuid()
//     .notNull()
//     .references(() => Products.id),
//   isPhysical: t.boolean("is_physical").notNull().default(false),
//   purchaseCount: t.integer("purchase_count"),
//   soldCount: t.integer("sold_count"),
//   description: t.text("description"),
//   specification: t.jsonb("specification").notNull(),
//   ratingsTotal: t.real("ratings_total"),
//   createdAt: t
//     .timestamp("created_at", { withTimezone: true })
//     .defaultNow()
//     .notNull(),
// }));

// Relations

export const UserRelations = relations(Users, ({ many }) => ({
  addresses: many(Addresses),

}));

export const AddressesRelations = relations(Addresses, ({ one }) => ({
  user: one(Users, {
    fields: [Addresses.userId],
    references: [Users.id],
  }),
}));

// export const ProductsRelations = relations(Products, ({ one, many }) => ({
//   productDetail: one(ProductDetails),
//   productDetails: many(ProductDetails),
// }));

// export const ProductDetailsRelations = relations(ProductDetails, ({ one }) => ({
//   product: one(Products, {
//     fields: [ProductDetails.productId],
//     references: [Products.id],
//   }),
// }));
