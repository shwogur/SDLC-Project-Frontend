import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, FileText, Users, CheckCircle } from "lucide-react";
import { Complaint } from "./ComplaintList";

interface DashboardProps {
  userType: "student" | "council" | "teacher";
  userId: string;
  complaints: Complaint[];
  onNavigate: (page: "form" | "list") => void;
}

export default function Dashboard({
  userType,
  userId,
  complaints,
  onNavigate,
}: DashboardProps) {
  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "student":
        return "학생";
      case "council":
        return "학생회";
      case "teacher":
        return "선생님";
      default:
        return "";
    }
  };

  const getWelcomeMessage = (type: string) => {
    switch (type) {
      case "student":
        return "민원을 등록하고 처리 상황을 확인할 수 있습니다.";
      case "council":
        return "학생들의 민원을 검토하고 승인/반려하거나 직접 처리할 수 있습니다.";
      case "teacher":
        return "학생회가 승인한 민원을 처리하고 상태를 업데이트할 수 있습니다.";
      default:
        return "";
    }
  };

  // 사용자별 통계 계산
  const getStats = () => {
    if (userType === "student") {
      const myComplaints = complaints.filter((c) => c.author === userId);
      return {
        total: myComplaints.length,
        pending: myComplaints.filter((c) => c.status === "pending").length,
        processing: myComplaints.filter((c) =>
          ["approved", "processing"].includes(c.status)
        ).length,
        completed: myComplaints.filter((c) =>
          ["completed", "rejected"].includes(c.status)
        ).length,
      };
    } else {
      return {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "pending").length,
        processing: complaints.filter((c) =>
          ["approved", "processing"].includes(c.status)
        ).length,
        completed: complaints.filter((c) =>
          ["completed", "rejected"].includes(c.status)
        ).length,
      };
    }
  };

  const stats = getStats();

  return (
    <div className="max-w-6xl mx-auto">
      {/* 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">
          안녕하세요, {getUserTypeLabel(userType)}님! 👋
        </h1>
        <p className="text-gray-600 text-lg">{getWelcomeMessage(userType)}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>전체 민원</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {userType === "student"
                  ? "내가 등록한 민원"
                  : "등록된 모든 민원"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>대기중</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {stats.pending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                검토 대기
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>진행중</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {stats.processing}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                처리중
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>완료</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.completed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">처리 완료</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userType === "student" && (
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNavigate("form")}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus size={20} />
                <span>새 민원 등록</span>
              </CardTitle>
              <CardDescription>
                새로운 민원을 등록하고 처리 요청을 할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">민원 등록하기</Button>
            </CardContent>
          </Card>
        )}

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("list")}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText size={20} />
              <span>
                {userType === "student" && "내 민원 조회"}
                {userType === "council" && "민원 검토 및 처리"}
                {userType === "teacher" && "민원 처리"}
              </span>
            </CardTitle>
            <CardDescription>
              {userType === "student" &&
                "등록한 민원의 처리 상황을 확인할 수 있습니다."}
              {userType === "council" &&
                "학생들의 민원을 검토하고 승인/반려 처리할 수 있습니다."}
              {userType === "teacher" &&
                "승인된 민원을 처리하고 상태를 업데이트할 수 있습니다."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              목록 보기
            </Button>
          </CardContent>
        </Card>

        {(userType === "council" || userType === "teacher") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users size={20} />
                <span>최근 활동</span>
              </CardTitle>
              <CardDescription>
                최근 처리한 민원들을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {complaints
                  .filter((c) => ["completed", "rejected"].includes(c.status))
                  .slice(0, 3)
                  .map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="truncate">{complaint.title}</span>
                      <Badge
                        className={
                          complaint.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {complaint.status === "completed" ? "완료" : "반려"}
                      </Badge>
                    </div>
                  ))}
                {complaints.filter((c) =>
                  ["completed", "rejected"].includes(c.status)
                ).length === 0 && (
                  <p className="text-gray-500 text-sm">
                    최근 처리한 민원이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 최근 민원 미리보기 */}
      {userType === "student" &&
        complaints.filter((c) => c.author === userId).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl mb-4">최근 등록한 민원</h2>
            <div className="space-y-3">
              {complaints
                .filter((c) => c.author === userId)
                .slice(0, 3)
                .map((complaint) => (
                  <Card
                    key={complaint.id}
                    className="hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{complaint.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {complaint.category} • {complaint.createdAt}
                          </p>
                        </div>
                        <Badge
                          className={
                            complaint.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : complaint.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : complaint.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {complaint.status === "pending"
                            ? "검토중"
                            : complaint.status === "completed"
                            ? "완료"
                            : complaint.status === "rejected"
                            ? "반려"
                            : "진행중"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}
