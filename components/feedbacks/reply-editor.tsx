"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { locales } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BlockColorsItem,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { useUser } from "@clerk/nextjs";
import { IconStars } from "@tabler/icons-react";
import { marked } from "marked";
import { useState } from "react";
import { toast } from "sonner";
import { ResetBlockTypeItem } from "./reset-block-type";

type Props = {
  onReply: (value: string) => void;
};

const ReplyEditor = ({ onReply }: Props) => {
  const [markdown, setMarkdown] = useState<string>("");
  const { user } = useUser();

  const editor = useCreateBlockNote({
    dictionary: locales.vi,
  });

  if (!user) {
    toast.error("Bạn cần đăng nhập để thực hiện thao tác này  ");
    return <div>Bạn cần đăng nhập để thực hiện thao tác này</div>;
  }

  const onChange = async () => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setMarkdown(markdown);
  };

  const onConfirmReply = async () => {
    const blocks = await editor.tryParseMarkdownToBlocks(markdown);
    editor.replaceBlocks(editor.document, blocks);
    onReply(markdown);
    setMarkdown("");
  };

  return (
    <div className="flex-1 rounded-md border-main dark:border-main-component border-2 ">
      <Tabs defaultValue="write">
        <TabsList className="ml-3">
          <TabsTrigger value="write">Chỉnh sửa</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>
        <TabsContent value="write">
          <BlockNoteView
            editor={editor}
            onChange={onChange}
            data-theming-css-demo
            data-theming-css-dark
            sideMenu={false}
          >
            <SideMenuController
              sideMenu={(props) => (
                <SideMenu
                  {...props}
                  dragHandleMenu={(props) => (
                    <DragHandleMenu {...props}>
                      <RemoveBlockItem {...props}>Xóa</RemoveBlockItem>
                      <BlockColorsItem {...props}>Màu sắc</BlockColorsItem>
                      <ResetBlockTypeItem {...props}>
                        Khôi phục định dạng
                      </ResetBlockTypeItem>
                    </DragHandleMenu>
                  )}
                />
              )}
            />
          </BlockNoteView>
        </TabsContent>
        <TabsContent value="preview">
          <div
            className="p-4"
            dangerouslySetInnerHTML={{ __html: marked(markdown) }} // Render Markdown as HTML
          />
        </TabsContent>
      </Tabs>
      <div className="flex items-center justify-between p-2 border-t-2 border-main dark:border-main-component divide-y-2">
        <div className="flex items-center gap-2 text-sm">
          <IconStars className="size-4" />
          Hỗ trợ Markdown
          <IconStars className="size-4" />
        </div>
        <Button
          onClick={() => onConfirmReply()}
          disabled={markdown === ""}
          size="sm"
          variant="outline"
        >
          Gửi phản hồi
        </Button>
      </div>
    </div>
  );
};

export default ReplyEditor;
