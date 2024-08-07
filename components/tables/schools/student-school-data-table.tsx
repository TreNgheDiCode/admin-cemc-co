"use client";

import { SchoolStudent } from "../../../types/school";
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronDown, SearchIcon, X } from "lucide-react";
import { ChangeEvent, Key, useCallback, useMemo, useState } from "react";
import { StudentSchoolCellAction } from "./student-school-cell-action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const columns = [
  { name: "STT", uid: "index", sortable: true },
  { name: "Mã học sinh", uid: "id", sortable: true },
  { name: "Họ và tên", uid: "name", sortable: true },
  { name: "Ngày sinh", uid: "dob", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Số điện thoại", uid: "phone", sortable: true },
  { name: "Giới tính", uid: "gender", sortable: true },
  { name: "Trạng thái", uid: "status", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "index",
  "name",
  "dob",
  "gender",
  "email",
  "phone",
  "actions",
];

const genderColorMap: Record<string, ChipProps["color"]> = {
  MALE: "success",
  FEMALE: "warning",
};

const genderLabelMap: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
};

const genderOptions = [
  { name: "Nam", uid: "MALE" },
  { name: "Nữ", uid: "FEMALE" },
];

const statusOptions = [
  { name: "Đã duyệt", uid: "APPROVED" },
  { name: "Đang học", uid: "STUDYING" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  APPROVED: "success",
  STUDYING: "warning",
};

const statusLabelMap: Record<string, string> = {
  APPROVED: "Đã duyệt",
  STUDYING: "Đang học",
};

type Props = {
  students: SchoolStudent[];
};

export const StudentsSchoolDataTable = ({ students }: Props) => {
  const [filterNameValue, setFilterNameValue] = useState("");
  const [filterDobValue, setFilterDobValue] = useState<Date>();
  const [filterEmailValue, setFilterEmailValue] = useState("");
  const [filterPhoneValue, setFilterPhoneValue] = useState("");
  const [genderFilter, setGenderFilter] = useState<Selection>("all");
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "startDate",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const hasSearchNameFilter = Boolean(filterNameValue);
  const hasSearchDobFilter = Boolean(filterDobValue);
  const hasSearchEmailFilter = Boolean(filterEmailValue);
  const hasSearchPhoneFilter = Boolean(filterPhoneValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredStudents = [...students];

    if (hasSearchNameFilter) {
      filteredStudents = filteredStudents.filter((student) =>
        student.account.name
          .toLowerCase()
          .includes(filterNameValue.toLowerCase())
      );
    }

    if (hasSearchDobFilter && filterDobValue) {
      const filterDob = new Date(filterDobValue);
      filteredStudents = filteredStudents.filter((student) => {
        const studentDob = new Date(student.account.dob);

        return studentDob.toDateString() === filterDob.toDateString();
      });
    }

    if (hasSearchEmailFilter) {
      filteredStudents = filteredStudents.filter((student) =>
        student.account.email
          .toLowerCase()
          .includes(filterEmailValue.toLowerCase())
      );
    }

    if (hasSearchPhoneFilter) {
      filteredStudents = filteredStudents.filter((student) =>
        student.account.phoneNumber
          .toLowerCase()
          .includes(filterPhoneValue.toLowerCase())
      );
    }

    if (
      genderFilter !== "all" &&
      Array.from(genderFilter).length !== genderOptions.length
    ) {
      console.log(genderFilter);
      filteredStudents = filteredStudents.filter((student) =>
        Array.from(genderFilter).includes(student.account.gender)
      );
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredStudents = filteredStudents.filter((student) =>
        Array.from(statusFilter).includes(student.status)
      );
    }

    return filteredStudents;
  }, [
    students,
    filterNameValue,
    filterDobValue,
    filterEmailValue,
    filterPhoneValue,
    genderFilter,
    statusFilter,
    hasSearchNameFilter,
    hasSearchDobFilter,
    hasSearchEmailFilter,
    hasSearchPhoneFilter,
  ]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items]
      .sort((a: SchoolStudent, b: SchoolStudent) => {
        const first = a[
          sortDescriptor.column as keyof SchoolStudent
        ] as unknown as number;
        const second = b[
          sortDescriptor.column as keyof SchoolStudent
        ] as unknown as number;
        const cmp = first < second ? -1 : first > second ? 1 : 0;

        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      })
      .map((item, index) => ({ ...item, index: index + 1 }));
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (student: SchoolStudent, columnKey: Key, index: number) => {
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
              {student.id}
            </p>
          );
        case "name":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {student.account.name}
            </p>
          );
        case "dob":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {student.account.dob
                ? format(new Date(student.account.dob), "dd/MM/yyyy", {
                    locale: vi,
                  })
                : "Không có thông tin"}
            </p>
          );
        case "email":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {student.account.email}
            </p>
          );
        case "phone":
          return (
            <p className="font-bold text-tiny capitalize text-primary">
              {student.account.phoneNumber}
            </p>
          );
        case "gender":
          return (
            <Chip
              className="capitalize"
              color={genderColorMap[student.account.gender]}
              size="sm"
              variant="flat"
            >
              {genderLabelMap[student.account.gender]}
            </Chip>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[student.status]}
              size="sm"
              variant="flat"
            >
              {statusLabelMap[student.status]}
            </Chip>
          );
        case "actions":
          return <StudentSchoolCellAction student={student} />;
      }
    },
    []
  );

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchNameChange = useCallback((value?: string) => {
    if (value) {
      setFilterNameValue(value);
      setPage(1);
    } else {
      setFilterNameValue("");
    }
  }, []);

  const onSearchDobChange = useCallback((value?: Date) => {
    if (value) {
      setFilterDobValue(value);
      setPage(1);
    } else {
      setFilterDobValue(undefined);
    }
  }, []);

  const onSearchEmailChange = useCallback((value?: string) => {
    if (value) {
      setFilterEmailValue(value);
      setPage(1);
    } else {
      setFilterEmailValue("");
    }
  }, []);

  const onSearchPhoneChange = useCallback((value?: string) => {
    if (value) {
      setFilterPhoneValue(value);
      setPage(1);
    } else {
      setFilterPhoneValue("");
    }
  }, []);

  const onClearSearchName = useCallback(() => {
    setFilterNameValue("");
    setPage(1);
  }, []);

  const onClearSearchDob = useCallback(() => {
    setFilterDobValue(undefined);
    setPage(1);
  }, []);

  const onClearSearchEmail = useCallback(() => {
    setFilterEmailValue("");
    setPage(1);
  }, []);

  const onClearSearchPhone = useCallback(() => {
    setFilterPhoneValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            isClearable
            variant="underlined"
            className="w-full"
            placeholder="Tên học sinh..."
            startContent={<SearchIcon />}
            value={filterNameValue}
            onClear={() => onClearSearchName()}
            onValueChange={onSearchNameChange}
          />
          <Input
            isClearable
            variant="underlined"
            className="w-full"
            placeholder="Email..."
            startContent={<SearchIcon />}
            value={filterEmailValue}
            onClear={() => onClearSearchEmail()}
            onValueChange={onSearchEmailChange}
          />
          <Input
            isClearable
            variant="underlined"
            className="w-full"
            placeholder="Số điện thoại..."
            startContent={<SearchIcon />}
            value={filterPhoneValue}
            onClear={() => onClearSearchPhone()}
            onValueChange={onSearchPhoneChange}
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
                selected={filterDobValue}
                onSelect={onSearchDobChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
                Trạng thái
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              {statusOptions.map((status) => (
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
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Tổng: {students.length} học sinh
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
    students,
    visibleColumns,
    onRowsPerPageChange,
    filterNameValue,
    filterDobValue,
    filterEmailValue,
    filterPhoneValue,
    genderFilter,
    statusFilter,
    onSearchNameChange,
    onSearchDobChange,
    onSearchEmailChange,
    onSearchPhoneChange,
    onClearSearchName,
    onClearSearchDob,
    onClearSearchEmail,
    onClearSearchPhone,
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
          onChange={setPage}
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
      aria-label="Bảng danh sách học sinh trường học"
      isHeaderSticky
      bottomContent={pages > 0 && bottomContent}
      bottomContentPlacement="outside"
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
      classNames={{
        base: "max-h-[calc(80vh-220px)] overflow-scroll",
        table: "min-h-[300px]",
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
      <TableBody emptyContent={"Không tìm thấy học sinh"} items={sortedItems}>
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
