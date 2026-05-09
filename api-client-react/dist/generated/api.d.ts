import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminLoginInput, AdminSession, Category, CreateCategoryBody, CreateProductBody, ErrorResponse, HealthStatus, ListProductsParams, Product, ReorderProductsBody, SiteSettings, UpdateCategoryBody, UpdateProductBody, UpdateSiteSettingsBody, UploadUrlInput, UploadUrlResult } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List categories
 */
export declare const getListCategoriesUrl: () => string;
export declare const listCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List active products
 */
export declare const getListProductsUrl: (params?: ListProductsParams) => string;
export declare const listProducts: (params?: ListProductsParams, options?: RequestInit) => Promise<Product[]>;
export declare const getListProductsQueryKey: (params?: ListProductsParams) => readonly ["/api/products", ...ListProductsParams[]];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List active products
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a single product
 */
export declare const getGetProductUrl: (id: string) => string;
export declare const getProduct: (id: string, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (id: string) => readonly [`/api/products/${string}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a single product
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin login with password
 */
export declare const getAdminLoginUrl: () => string;
export declare const adminLogin: (adminLoginInput: AdminLoginInput, options?: RequestInit) => Promise<AdminSession>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginInput>;
export type AdminLoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Admin login with password
 */
export declare const useAdminLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
/**
 * @summary Admin logout
 */
export declare const getAdminLogoutUrl: () => string;
export declare const adminLogout: (options?: RequestInit) => Promise<void>;
export declare const getAdminLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
export type AdminLogoutMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogout>>>;
export type AdminLogoutMutationError = ErrorType<unknown>;
/**
 * @summary Admin logout
 */
export declare const useAdminLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
/**
 * @summary Check admin session status
 */
export declare const getGetAdminMeUrl: () => string;
export declare const getAdminMe: (options?: RequestInit) => Promise<AdminSession>;
export declare const getGetAdminMeQueryKey: () => readonly ["/api/admin/me"];
export declare const getGetAdminMeQueryOptions: <TData = Awaited<ReturnType<typeof getAdminMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminMeQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminMe>>>;
export type GetAdminMeQueryError = ErrorType<unknown>;
/**
 * @summary Check admin session status
 */
export declare function useGetAdminMe<TData = Awaited<ReturnType<typeof getAdminMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all products including inactive
 */
export declare const getAdminListProductsUrl: () => string;
export declare const adminListProducts: (options?: RequestInit) => Promise<Product[]>;
export declare const getAdminListProductsQueryKey: () => readonly ["/api/admin/products"];
export declare const getAdminListProductsQueryOptions: <TData = Awaited<ReturnType<typeof adminListProducts>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListProducts>>>;
export type AdminListProductsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List all products including inactive
 */
export declare function useAdminListProducts<TData = Awaited<ReturnType<typeof adminListProducts>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a product
 */
export declare const getAdminCreateProductUrl: () => string;
export declare const adminCreateProduct: (createProductBody: CreateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getAdminCreateProductMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
export type AdminCreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateProduct>>>;
export type AdminCreateProductMutationBody = BodyType<CreateProductBody>;
export type AdminCreateProductMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Create a product
 */
export declare const useAdminCreateProduct: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
/**
 * @summary Update a product
 */
export declare const getAdminUpdateProductUrl: (id: string) => string;
export declare const adminUpdateProduct: (id: string, updateProductBody: UpdateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getAdminUpdateProductMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateProduct>>, TError, {
        id: string;
        data: BodyType<UpdateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateProduct>>, TError, {
    id: string;
    data: BodyType<UpdateProductBody>;
}, TContext>;
export type AdminUpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateProduct>>>;
export type AdminUpdateProductMutationBody = BodyType<UpdateProductBody>;
export type AdminUpdateProductMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update a product
 */
export declare const useAdminUpdateProduct: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateProduct>>, TError, {
        id: string;
        data: BodyType<UpdateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateProduct>>, TError, {
    id: string;
    data: BodyType<UpdateProductBody>;
}, TContext>;
/**
 * @summary Delete a product
 */
export declare const getAdminDeleteProductUrl: (id: string) => string;
export declare const adminDeleteProduct: (id: string, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteProductMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteProduct>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteProduct>>, TError, {
    id: string;
}, TContext>;
export type AdminDeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteProduct>>>;
export type AdminDeleteProductMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete a product
 */
export declare const useAdminDeleteProduct: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteProduct>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteProduct>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Update sort order in bulk
 */
export declare const getAdminReorderProductsUrl: () => string;
export declare const adminReorderProducts: (reorderProductsBody: ReorderProductsBody, options?: RequestInit) => Promise<void>;
export declare const getAdminReorderProductsMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminReorderProducts>>, TError, {
        data: BodyType<ReorderProductsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminReorderProducts>>, TError, {
    data: BodyType<ReorderProductsBody>;
}, TContext>;
export type AdminReorderProductsMutationResult = NonNullable<Awaited<ReturnType<typeof adminReorderProducts>>>;
export type AdminReorderProductsMutationBody = BodyType<ReorderProductsBody>;
export type AdminReorderProductsMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update sort order in bulk
 */
export declare const useAdminReorderProducts: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminReorderProducts>>, TError, {
        data: BodyType<ReorderProductsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminReorderProducts>>, TError, {
    data: BodyType<ReorderProductsBody>;
}, TContext>;
/**
 * @summary Create a category
 */
export declare const getAdminCreateCategoryUrl: () => string;
export declare const adminCreateCategory: (createCategoryBody: CreateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getAdminCreateCategoryMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
export type AdminCreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateCategory>>>;
export type AdminCreateCategoryMutationBody = BodyType<CreateCategoryBody>;
export type AdminCreateCategoryMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Create a category
 */
export declare const useAdminCreateCategory: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
/**
 * @summary Update a category
 */
export declare const getAdminUpdateCategoryUrl: (slug: string) => string;
export declare const adminUpdateCategory: (slug: string, updateCategoryBody: UpdateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getAdminUpdateCategoryMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateCategory>>, TError, {
        slug: string;
        data: BodyType<UpdateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateCategory>>, TError, {
    slug: string;
    data: BodyType<UpdateCategoryBody>;
}, TContext>;
export type AdminUpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateCategory>>>;
export type AdminUpdateCategoryMutationBody = BodyType<UpdateCategoryBody>;
export type AdminUpdateCategoryMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update a category
 */
export declare const useAdminUpdateCategory: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateCategory>>, TError, {
        slug: string;
        data: BodyType<UpdateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateCategory>>, TError, {
    slug: string;
    data: BodyType<UpdateCategoryBody>;
}, TContext>;
/**
 * @summary Delete a category
 */
export declare const getAdminDeleteCategoryUrl: (slug: string) => string;
export declare const adminDeleteCategory: (slug: string, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteCategoryMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteCategory>>, TError, {
        slug: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteCategory>>, TError, {
    slug: string;
}, TContext>;
export type AdminDeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteCategory>>>;
export type AdminDeleteCategoryMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete a category
 */
export declare const useAdminDeleteCategory: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteCategory>>, TError, {
        slug: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteCategory>>, TError, {
    slug: string;
}, TContext>;
/**
 * @summary Get site-wide settings
 */
export declare const getGetSiteSettingsUrl: () => string;
export declare const getSiteSettings: (options?: RequestInit) => Promise<SiteSettings>;
export declare const getGetSiteSettingsQueryKey: () => readonly ["/api/admin/site-settings"];
export declare const getGetSiteSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSiteSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSiteSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSiteSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSiteSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSiteSettings>>>;
export type GetSiteSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get site-wide settings
 */
export declare function useGetSiteSettings<TData = Awaited<ReturnType<typeof getSiteSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSiteSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update site-wide settings
 */
export declare const getAdminUpdateSiteSettingsUrl: () => string;
export declare const adminUpdateSiteSettings: (updateSiteSettingsBody: UpdateSiteSettingsBody, options?: RequestInit) => Promise<SiteSettings>;
export declare const getAdminUpdateSiteSettingsMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateSiteSettings>>, TError, {
        data: BodyType<UpdateSiteSettingsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateSiteSettings>>, TError, {
    data: BodyType<UpdateSiteSettingsBody>;
}, TContext>;
export type AdminUpdateSiteSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateSiteSettings>>>;
export type AdminUpdateSiteSettingsMutationBody = BodyType<UpdateSiteSettingsBody>;
export type AdminUpdateSiteSettingsMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update site-wide settings
 */
export declare const useAdminUpdateSiteSettings: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateSiteSettings>>, TError, {
        data: BodyType<UpdateSiteSettingsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateSiteSettings>>, TError, {
    data: BodyType<UpdateSiteSettingsBody>;
}, TContext>;
/**
 * @summary Request a presigned upload URL
 */
export declare const getRequestUploadUrlUrl: () => string;
export declare const requestUploadUrl: (uploadUrlInput: UploadUrlInput, options?: RequestInit) => Promise<UploadUrlResult>;
export declare const getRequestUploadUrlMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<UploadUrlInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<UploadUrlInput>;
}, TContext>;
export type RequestUploadUrlMutationResult = NonNullable<Awaited<ReturnType<typeof requestUploadUrl>>>;
export type RequestUploadUrlMutationBody = BodyType<UploadUrlInput>;
export type RequestUploadUrlMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Request a presigned upload URL
 */
export declare const useRequestUploadUrl: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<UploadUrlInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<UploadUrlInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map