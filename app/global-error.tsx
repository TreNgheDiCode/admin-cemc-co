"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Có lỗi xảy ra!</h2>
        <button onClick={() => reset()}>Đường dẫn không tồn tại</button>
      </body>
    </html>
  );
}
