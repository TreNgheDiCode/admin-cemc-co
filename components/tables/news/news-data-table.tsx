"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GetNews } from "@/data/news";
import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import { Chip, ChipProps } from "@nextui-org/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Pagination } from "@nextui-org/pagination";
import {
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { NewsType } from "@prisma/client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronDown, SearchIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NewsCellAction } from "./news-cell-action";
import { NewsLib } from "@/types/news";

type Props = {
  news: NewsLib[];
};

const columns = [
  { name: "STT", uid: "index", sortable: true },
  { name: "Hành động", uid: "actions" },
  { name: "Mã tin tức", uid: "id", sortable: true },
  { name: "Tiêu đề", uid: "title", sortable: true },
  { name: "Trường học", uid: "school.name", sortable: true },
  { name: "Loại tin", uid: "type", sortable: true },
  { name: "Tình trạng", uid: "isPublished", sortable: true },
  { name: "Ngày tạo", uid: "createdAt", sortable: true },
  { name: "Ngày cập nhật", uid: "updatedAt  ", sortable: true },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "actions",
  "id",
  "title",
  "school.name",
  "type",
  "isPublished",
  "createdAt",
];

const newsTypeColorMap: Record<NewsType, ChipProps["color"]> = {
  ANNOUNCEMENT: "warning",
  EVENT: "success",
  BLOG: "primary",
};

const newsTypeLabelMap: Record<NewsType, string> = {
  ANNOUNCEMENT: "Thông báo",
  EVENT: "Sự kiện",
  BLOG: "Bài viết",
};

const newsTypeOptions = [
  { name: "Thông báo", uid: "ANNOUNCEMENT" },
  { name: "Sự kiện", uid: "EVENT" },
  { name: "Bài viết", uid: "BLOG" },
];

const publishedColorMap: Record<string, ChipProps["color"]> = {
  true: "success",
  false: "danger",
};

const publishedLabelMap: Record<string, string> = {
  true: "Đã xuất bản",
  false: "Tạm ẩn",
};

const publishedOptions = [
  { name: "Đã xuất bản", uid: "true" },
  { name: "Tạm ẩn", uid: "false" },
];

export const NewsDataTable = ({ news }: Props) => {
  const [filterSearchValue, setFilterSearchValue] = useState("");
  const [filterCreatedAtValue, setFilterCreatedAtValue] = useState<Date | null>(
    null
  );
  const [publishedFilter, setPublishedFilter] = useState<Selection>("all");
  const [typeFilter, setTypeFilter] = useState<Selection>("all");

  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [currentPage, setCurrentPage] = useState(page);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});

  const hasSearchFilter = Boolean(filterSearchValue);
  const hasCreatedAtFilter = Boolean(filterCreatedAtValue);

  const pages = Math.ceil(news.length / rowsPerPage);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredNews = [...news];

    if (hasSearchFilter) {
      filteredNews = filteredNews.filter((news) =>
        Object.values(news).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(filterSearchValue.toLowerCase())
        )
      );
    }

    if (hasCreatedAtFilter) {
      filteredNews = filteredNews.filter((news) => {
        const newsCreatedAt = new Date(news.createdAt);
        return (
          newsCreatedAt.getDate() === filterCreatedAtValue?.getDate() &&
          newsCreatedAt.getMonth() === filterCreatedAtValue?.getMonth() &&
          newsCreatedAt.getFullYear() === filterCreatedAtValue?.getFullYear()
        );
      });
    }

    if (
      typeFilter !== "all" &&
      Array.from(typeFilter).length !== newsTypeOptions.length
    ) {
      filteredNews = filteredNews.filter((news) =>
        Array.from(typeFilter).includes(news.type)
      );
    }

    if (
      publishedFilter !== "all" &&
      Array.from(publishedFilter).length !== publishedOptions.length
    ) {
      filteredNews = filteredNews.filter((news) =>
        Array.from(publishedFilter).includes(news.isPublished.toString())
      );
    }

    return filteredNews;
  }, [
    news,
    publishedFilter,
    typeFilter,
    filterSearchValue,
    filterCreatedAtValue,
    hasSearchFilter,
    hasCreatedAtFilter,
  ]);

  const items = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [currentPage, rowsPerPage, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items]
      .sort((a: NewsLib, b: NewsLib) => {
        const first = a[
          sortDescriptor.column as keyof NewsLib
        ] as unknown as number;
        const second = b[
          sortDescriptor.column as keyof NewsLib
        ] as unknown as number;
        const cmp = first < second ? -1 : first > second ? 1 : 0;

        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      })
      .map((item, index) => ({ ...item, index: index + 1 }));
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (news: NewsLib, columnKey: Key, index: number) => {
      switch (columnKey) {
        case "index":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {index + 1}
            </p>
          );
        case "id":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {news.id}
            </p>
          );
        case "title":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {news.title}
            </p>
          );
        case "school.name":
          return news.school ? (
            <p className="font-bold text-tiny capitalize text-primary">
              {news.school.name}
            </p>
          ) : (
            <p className="font-bold text-tiny capitalize text-primary">
              Không có trường học
            </p>
          );
        case "type":
          return (
            <Chip
              className="capitalize"
              color={newsTypeColorMap[news.type]}
              size="sm"
              variant="flat"
            >
              {newsTypeLabelMap[news.type]}
            </Chip>
          );
        case "isPublished":
          return (
            <Chip
              className="capitalize"
              color={publishedColorMap[news.isPublished.toString()]}
              size="sm"
              variant="flat"
            >
              {publishedLabelMap[news.isPublished.toString()]}
            </Chip>
          );
        case "createdAt":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {format(new Date(news.createdAt), "dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
          );
        case "updatedAt":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {format(new Date(news.updatedAt), "dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
          );
        case "actions":
          return <NewsCellAction news={news} />;
      }
    },
    []
  );

  const onPaginationChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      const newParams = params.toString();

      const newPathname = pathname + "?" + newParams;

      router.push(newPathname);
    },
    [searchParams, pathname, router]
  );

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setCurrentPage(page + 1);
      onPaginationChange("page", String(page + 1));
    }
  }, [page, pages, onPaginationChange]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setCurrentPage(page - 1);
      onPaginationChange("page", String(page - 1));
    }
  }, [page, onPaginationChange]);

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setCurrentPage(1);

      onPaginationChange("pageSize", e.target.value);
      onPaginationChange("page", "1");
    },
    [onPaginationChange]
  );

  useEffect(() => {
    // If any filter/search state changes, reset the pagination to the first page.
    setCurrentPage(1);
    onPaginationChange("page", "1");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSearchValue, filterCreatedAtValue, publishedFilter, typeFilter]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterSearchValue(value);
    } else {
      setFilterSearchValue("");
    }
  }, []);

  const onSearchCreatedAtChange = useCallback((date: Date) => {
    setFilterCreatedAtValue(date);
  }, []);

  const onClearSearch = useCallback(() => {
    setFilterSearchValue("");
  }, []);

  const onClearSearchCreatedAt = useCallback(() => {
    setFilterCreatedAtValue(null);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            isClearable
            variant="underlined"
            className="w-full"
            placeholder="Tìm kiếm thông tin..."
            startContent={<SearchIcon />}
            value={filterSearchValue}
            onClear={() => onClearSearch()}
            onValueChange={onSearchChange}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"flat"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !filterCreatedAtValue && "text-muted-foreground"
                )}
                endContent={
                  filterCreatedAtValue && (
                    <X
                      className="size-4 text-rose-500"
                      onClick={onClearSearchCreatedAt}
                    />
                  )
                }
              >
                {filterCreatedAtValue ? (
                  format(new Date(filterCreatedAtValue), "dd/MM/yyyy", {
                    locale: vi,
                  })
                ) : (
                  <span>Chọn ngày xuất bản</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                fromYear={1970}
                toYear={2050}
                selected={filterCreatedAtValue ?? undefined}
                onSelect={(value) => {
                  if (!value) return;
                  onSearchCreatedAtChange(value);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant={"bordered"}
            size={"md"}
            onClick={() => {
              router.push("/news/create");
            }}
          >
            Thêm tin tức
          </Button>
          <div className="flex justify-end items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
                  Đã xuất bản
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={publishedFilter}
                selectionMode="multiple"
                onSelectionChange={setPublishedFilter}
              >
                {publishedOptions.map((gender) => (
                  <DropdownItem key={gender.uid} className="capitalize">
                    {gender.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
                  Loại tin tức
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={typeFilter}
                selectionMode="multiple"
                onSelectionChange={setTypeFilter}
              >
                {newsTypeOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
                  Hiển thị
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
                className="overflow-scroll h-[320px]"
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Tổng: {news.length} tin tức
          </span>
          <label className="flex items-center text-default-400 text-small">
            Số dòng mỗi trang:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    news,
    onRowsPerPageChange,
    filterSearchValue,
    filterCreatedAtValue,
    publishedFilter,
    typeFilter,
    visibleColumns,
    router,
    onSearchChange,
    onSearchCreatedAtChange,
    onClearSearch,
    onClearSearchCreatedAt,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <div />
        <div />
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setCurrentPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Trước
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Sau
          </Button>
        </div>
      </div>
    );
  }, [page, pages, onNextPage, onPreviousPage]);

  return (
    <Table
      aria-label="Bảng danh sách tin tức"
      isHeaderSticky
      bottomContent={pages > 0 && bottomContent}
      bottomContentPlacement="outside"
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
      classNames={{
        base: "max-h-[70vh] overflow-hidden",
        table: "min-h-[400px] md:min-h-[500px]",
      }}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"Không tìm thấy tin tức"} items={sortedItems}>
        {sortedItems.map((item, index) => (
          <TableRow key={item.id}>
            {(columnKey) => {
              // @ts-ignore
              return (
                <TableCell>{renderCell(item, columnKey, index)}</TableCell>
              );
            }}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
