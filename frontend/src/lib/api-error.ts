/* ──────────────────────────────────────────────
 *  Normalized API error – shared across all forms
 * ────────────────────────────────────────────── */

export type ApiError = {
  status: number;
  code: string;
  detail: string;
  fields?: Record<string, string[]>;
};

export class ApiRequestError extends Error {
  public readonly isApiRequestError = true;
  public readonly error: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.detail);
    this.name = "ApiRequestError";
    this.error = apiError;
  }
}

export function isApiRequestError(err: unknown): err is ApiRequestError {
  return err instanceof Error && "isApiRequestError" in err && err.isApiRequestError === true;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "code" in value &&
    "detail" in value
  );
}

/**
 * Parse a non-ok Response into a normalized ApiError.
 *
 * Django REST framework returns validation errors as `{ field: [msgs] }` or
 * business errors as `{ code, detail }`. This function handles both shapes.
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;

  try {
    const body = await response.json();

    // DRF validation error: { field_name: ["error msg", …], … }
    if (status === 400 && !body.code) {
      const fields: Record<string, string[]> = {};
      let detail = "Validation failed.";

      for (const [key, value] of Object.entries(body)) {
        if (key === "non_field_errors") {
          detail = (value as string[]).join(" ");
        } else if (key === "detail") {
          detail = value as string;
        } else {
          fields[key] = value as string[];
        }
      }

      return { status, code: "validation_error", detail, fields };
    }

    // Business / permission error: { code, detail }
    return {
      status,
      code: body.code ?? `http_${status}`,
      detail: body.detail ?? response.statusText,
      fields: body.fields,
    };
  } catch {
    return {
      status,
      code: `http_${status}`,
      detail: response.statusText || "An unexpected error occurred.",
    };
  }
}
