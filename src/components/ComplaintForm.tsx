import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface ComplaintFormProps {
  userId: string;
  onBack?: () => void;
  onSubmit: (data: {
    category: string;
    title: string;
    content: string;
    author: string;
  }) => void;
}

export default function ComplaintForm({
  userId,
  onBack,
  onSubmit,
}: ComplaintFormProps) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const categories = [
    "시설 관련",
    "식당 관련",
    "교육 관련",
    "동아리 활동",
    "생활 지도",
    "기타",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error("카테고리를 선택하지 않았습니다.");
      return;
    }

    if (!title.trim()) {
      toast.error("제목을 입력하지 않았습니다.");
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력하지 않았습니다.");
      return;
    }

    if (title.length > 20) {
      toast.error("제목은 20자를 초과할 수 없습니다.");
      return;
    }

    if (content.length > 500) {
      toast.error("내용은 500자를 초과할 수 없습니다.");
      return;
    }

    onSubmit({
      category,
      title: title.trim(),
      content: content.trim(),
      author: userId,
    });

    // 폼 초기화
    setCategory("");
    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {onBack && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>대시보드로 돌아가기</span>
          </Button>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>민원 등록</CardTitle>
          <CardDescription>
            겪고 있는 고충이나 민원을 등록해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= 20) setTitle(e.target.value);
                }}
                placeholder="민원 제목을 입력해주세요"
                maxLength={100}
              />
              <div className="text-right text-sm text-gray-500">
                {title.length}/20자
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setContent(e.target.value);
                }}
                placeholder="민원 내용을 자세히 입력해주세요"
                rows={6}
                className="resize-none"
              />
              <div className="text-right text-sm text-gray-500">
                {content.length}/500자
              </div>
            </div>

            <Button type="submit" className="w-full">
              민원 신청
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
