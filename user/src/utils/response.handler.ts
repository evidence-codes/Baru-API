export function successResponse<TD>({
  message,
  data,
  status,
}: {
  message: string;
  data?: TD;
  status?: number;
}) {
  return {
    success: true,
    status: status ?? 200,
    message,
    data,
  };
}

export const errorResponse = ({
  message,
  status,
}: {
  message: string;
  status?: number;
}) => {
  return {
    success: false,
    status: status ?? 400,
    message,
  };
};
