"use client";

import { ClientComponentSearch, search } from "@/action/search";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  SearchModal,
  SearchModalBody,
  SearchModalContent,
  SearchModalFooter,
  SearchModalTrigger,
} from "./search-modal";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const QuickSearch = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [searchResult, setSearchResult] = useState<ClientComponentSearch[]>([]);

  const formSchema = z.object({
    searchQuery: z.string().optional(),
  });
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchQuery: "",
    },
  });

  const { control, handleSubmit, watch } = form;

  const searchQuery = watch("searchQuery");

  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  const onSearching = async (values: FormValues) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setLoading(true);
    setTypingTimeout(
      setTimeout(async () => {
        if (values.searchQuery === "") {
          setSearchResult([]);
          setLoading(false);
          return;
        }
        await search(values)
          .then((data) => {
            if (data.length > 0) {
              setSearchResult(data);
            } else {
              setSearchResult([]);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }, 500)
    );
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <SearchModal>
      <SearchModalTrigger>
        <div className="flex items-center gap-2 shadow-lg border py-2 px-4 rounded-md group hover:scale-105 transition">
          <Search className="size-4" />
          <span className="whitespace-nowrap group-hover:font-semibold transition">
            Tìm kiếm nhanh
          </span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </SearchModalTrigger>
      <SearchModalBody>
        <SearchModalContent className="max-h-[70%] overflow-y-scroll">
          <h1 className="text-2xl font-semibold text-main dark:text-main-foreground text-center">
            Tìm kiếm nhanh
          </h1>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                control={control}
                name="searchQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        autoFocus={true}
                        placeholder="Tìm kiếm thông tin về trường học, học sinh, tin tức,..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onSearching({ searchQuery: e.target.value });
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          {searchQuery &&
            (loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main"></div>
              </div>
            ) : searchResult.length > 0 ? (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {searchResult.map((result, index) => (
                  <div key={index} className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={result.image} alt={result.name} />
                        <AvatarFallback>
                          <Image
                            fill
                            src="/logo_icon_light.png"
                            alt={result.name}
                            quality={100}
                            priority
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{result.name}</div>
                        <div className="text-neutral-500 dark:text-neutral-400">
                          {result.chipValue}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (result.schoolSub && result.schoolSubId) {
                            return router.push(
                              `/${result.type}/${result.id}/${result.schoolSub}/${result.schoolSubId}`
                            );
                          }

                          router.push(`/${result.type}/${result.id}`);
                        }}
                        className="ml-auto bg-main hover:bg-main/70 dark:bg-main-component hover:dark:bg-main-component/70 text-white dark:text-main-foreground transition"
                      >
                        Xem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Không tìm thấy kết quả
                </span>
              </div>
            ))}
        </SearchModalContent>
      </SearchModalBody>
    </SearchModal>
  );
};
