"use client";

import { AccountLib } from "@/types/account";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronDown, SearchIcon, X } from "lucide-react";
import {
  ChangeEvent,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Gender, StudentStatus } from "@prisma/client";
import { Chip, ChipProps } from "@nextui-org/chip";
import { AccountCellAction } from "./account-cell-action";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@nextui-org/input";
import { IconRefreshDot } from "@tabler/icons-react";

type Props = {
  accounts: AccountLib[];
};

const columns = [
  { name: "STT", uid: "index", sortable: true },
  { name: "Hành động", uid: "actions" },
  { name: "Mã tài khoản", uid: "id", sortable: true },
  { name: "Họ và tên", uid: "name", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Số điện thoại", uid: "phoneNumber", sortable: true },
  { name: "Địa chỉ", uid: "address", sortable: true },
  { name: "CMND", uid: "idCardNumber", sortable: true },
  { name: "Ngày sinh", uid: "dob", sortable: true },
  { name: "Tạo lúc", uid: "createdAt", sortable: true },
  { name: "Tình trạng", uid: "student.status", sortable: true },
  { name: "Đã khóa", uid: "isLocked", sortable: true },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "actions",
  "name",
  "email",
  "phoneNumber",
  "dob",
  "gender",
  "createdAt",
  "isLocked",
];

const studentStatusColorMap: Record<StudentStatus, ChipProps["color"]> = {
  APPROVED: "success",
  AWAITING: "warning",
  DROPPED: "danger",
  STUDYING: "primary",
};

const studentStatusLabelMap: Record<StudentStatus, string> = {
  APPROVED: "Đã duyệt",
  AWAITING: "Chờ duyệt",
  DROPPED: "Đã nghỉ học",
  STUDYING: "Đang học",
};

const studentStatusOptions = [
  { name: "APPROVED", uid: "Đã duyệt" },
  { name: "AWAITING", uid: "Chờ duyệt" },
  { name: "DROPPED", uid: "Đã nghỉ học" },
  { name: "STUDYING", uid: "Đang học" },
];

const genderColorMap: Record<string, ChipProps["color"]> = {
  MALE: "success",
  FEMALE: "warning",
};

const genderLabelMap: Record<Gender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
};

const genderOptions = [
  { name: "Nam", uid: "MALE" },
  { name: "Nữ", uid: "FEMALE" },
];

const lockedColorMap: Record<string, ChipProps["color"]> = {
  true: "danger",
  false: "success",
};

const lockedLabelMap: Record<string, string> = {
  true: "Đã khóa",
  false: "Đang kích hoạt",
};

const lockedOptions = [
  { name: "Đã khóa", uid: "true" },
  { name: "Đang kích hoạt", uid: "false" },
];

export const AccountsDataTable = ({ accounts }: Props) => {
  const [filterSearchValue, setFilterSearchValue] = useState("");
  const [filterDobValue, setFilterDobValue] = useState<Date | null>(null);
  const [genderFilter, setGenderFilter] = useState<Selection>("all");
  const [studentStatusFilter, setStudentStatusFilter] =
    useState<Selection>("all");
  const [lockedFilter, setLockedFilter] = useState<Selection>("all");

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
  const hasDobFilter = Boolean(filterDobValue);

  const pages = Math.ceil(accounts.length / rowsPerPage);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredAccounts = [...accounts];

    if (hasSearchFilter) {
      filteredAccounts = filteredAccounts.filter((account) =>
        Object.values(account).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(filterSearchValue.toLowerCase())
        )
      );
    }

    if (hasDobFilter) {
      filteredAccounts = filteredAccounts.filter((account) => {
        const accountDob = new Date(account.dob);
        return (
          accountDob.getDate() === filterDobValue?.getDate() &&
          accountDob.getMonth() === filterDobValue?.getMonth() &&
          accountDob.getFullYear() === filterDobValue?.getFullYear()
        );
      });
    }

    if (
      genderFilter !== "all" &&
      Array.from(genderFilter).length !== genderOptions.length
    ) {
      filteredAccounts = filteredAccounts.filter((account) =>
        Array.from(genderFilter).includes(account.gender)
      );
    }

    if (
      studentStatusFilter !== "all" &&
      Array.from(studentStatusFilter).length !== studentStatusOptions.length
    ) {
      filteredAccounts = filteredAccounts.filter((account) => {
        if (!account.student) return false;
        return Array.from(studentStatusFilter).includes(account.student.status);
      });
    }

    if (
      lockedFilter !== "all" &&
      Array.from(lockedFilter).length !== lockedOptions.length
    ) {
      filteredAccounts = filteredAccounts.filter((account) =>
        Array.from(lockedFilter).includes(account.isLocked.toString())
      );
    }

    return filteredAccounts;
  }, [
    accounts,
    filterSearchValue,
    filterDobValue,
    genderFilter,
    studentStatusFilter,
    lockedFilter,
    hasSearchFilter,
    hasDobFilter,
  ]);

  const items = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [currentPage, rowsPerPage, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items]
      .sort((a: AccountLib, b: AccountLib) => {
        const first = a[
          sortDescriptor.column as keyof AccountLib
        ] as unknown as number;
        const second = b[
          sortDescriptor.column as keyof AccountLib
        ] as unknown as number;
        const cmp = first < second ? -1 : first > second ? 1 : 0;

        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      })
      .map((item, index) => ({ ...item, index: index + 1 }));
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (account: AccountLib, columnKey: Key, index: number) => {
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
              {account.id}
            </p>
          );
        case "name":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {account.name}
            </p>
          );
        case "dob":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {account.dob
                ? format(new Date(account.dob), "dd/MM/yyyy", {
                    locale: vi,
                  })
                : "Không có thông tin"}
            </p>
          );
        case "email":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {account.email}
            </p>
          );
        case "phoneNumber":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {account.phoneNumber}
            </p>
          );
        case "address":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {account.address}
            </p>
          );
        case "idCardNumber":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {account.idCardNumber}
            </p>
          );
        case "createdAt":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {format(new Date(account.createdAt), "dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
          );
        case "isLocked":
          return (
            <Chip
              className="capitalize"
              color={lockedColorMap[account.isLocked.toString()]}
              size="sm"
              variant="flat"
            >
              {lockedLabelMap[account.isLocked.toString()]}
            </Chip>
          );
        case "gender":
          return (
            <Chip
              className="capitalize"
              color={genderColorMap[account.gender]}
              size="sm"
              variant="flat"
            >
              {genderLabelMap[account.gender]}
            </Chip>
          );
        case "student.status":
          return account.student ? (
            <Chip
              className="capitalize"
              color={studentStatusColorMap[account.student.status]}
              size="sm"
              variant="flat"
            >
              {studentStatusLabelMap[account.student.status]}
            </Chip>
          ) : (
            <p className="font-bold text-tiny capitalize text-primary">
              Không có thông tin học sinh
            </p>
          );
        case "actions":
          return <AccountCellAction account={account} />;
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
  }, [
    filterSearchValue,
    filterDobValue,
    genderFilter,
    studentStatusFilter,
    lockedFilter,
  ]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterSearchValue(value);
    } else {
      setFilterSearchValue("");
    }
  }, []);

  const onSearchDobChange = useCallback((date: Date) => {
    setFilterDobValue(date);
  }, []);

  const onClearSearch = useCallback(() => {
    setFilterSearchValue("");
  }, []);

  const onClearSearchDob = useCallback(() => {
    setFilterDobValue(null);
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
                  !filterDobValue && "text-muted-foreground"
                )}
                endContent={
                  filterDobValue && (
                    <X
                      className="size-4 text-rose-500"
                      onClick={onClearSearchDob}
                    />
                  )
                }
              >
                {filterDobValue ? (
                  format(new Date(filterDobValue), "dd/MM/yyyy", {
                    locale: vi,
                  })
                ) : (
                  <span>Chọn ngày sinh</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                fromYear={1970}
                toYear={2050}
                selected={filterDobValue ?? undefined}
                onSelect={(value) => {
                  if (!value) return;
                  onSearchDobChange(value);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconRefreshDot
              className="cursor-pointer hover:animate-spin transition"
              onClick={() => router.refresh()}
            />
          </div>
          <div className="flex justify-end items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
                  Giới tính
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={genderFilter}
                selectionMode="multiple"
                onSelectionChange={setGenderFilter}
              >
                {genderOptions.map((gender) => (
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
                  Tình trạng
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={studentStatusFilter}
                selectionMode="multiple"
                onSelectionChange={setStudentStatusFilter}
              >
                {studentStatusOptions.map((status) => (
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
                  Đã khóa
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={lockedFilter}
                selectionMode="multiple"
                onSelectionChange={setLockedFilter}
              >
                {lockedOptions.map((locked) => (
                  <DropdownItem key={locked.uid} className="capitalize">
                    {locked.name}
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
            Tổng: {accounts.length} tài khoản
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
    accounts,
    visibleColumns,
    onRowsPerPageChange,
    filterSearchValue,
    filterDobValue,
    genderFilter,
    studentStatusFilter,
    lockedFilter,
    onSearchChange,
    onSearchDobChange,
    onClearSearch,
    onClearSearchDob,
    router,
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
      aria-label="Bảng danh sách tài khoản"
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
      <TableBody emptyContent={"Không tìm thấy tài khoản"} items={sortedItems}>
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
