import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { toast } from "sonner@2.0.3";
import { Mail, CheckCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: (
    userType: "student" | "council" | "teacher",
    userId: string
  ) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [schoolId, setSchoolId] = useState("");
  const [userType, setUserType] = useState<"student" | "council" | "teacher">(
    "student"
  );
  const [isTeacher, setIsTeacher] = useState(false);
  const [verificationStep, setVerificationStep] = useState<"email" | "code">(
    "email"
  );
  const [enteredCode, setEnteredCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  // 🔥 새로운 직위 자동 판별 규칙
  // sdh로 시작하지 않으면 → 선생님
  // sdh로 시작하면 → 학생/학생회
  useEffect(() => {
    if (!schoolId.trim()) return;

    const localPart = schoolId.split("@")[0] || "";

    if (!localPart.startsWith("sdh")) {
      setIsTeacher(true);
      setUserType("teacher");
    } else {
      setIsTeacher(false);
      if (userType === "teacher") setUserType("student");
    }
  }, [schoolId]);

  // 인증번호 요청
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8070/api/auth/send-code", null, {
        params: { email: schoolId },
      });

      setIsCodeSent(true);
      setVerificationStep("code");
      toast.success(`${schoolId}로 인증번호가 발송되었습니다.`);
    } catch (err) {
      console.error(err);
      toast.error("인증번호 발송에 실패했습니다.");
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8070/api/auth/verify",
        null,
        { params: { email: schoolId, code: enteredCode } }
      );

      if (res.data === true) {
        toast.success("인증 성공!");
        onLogin(userType, schoolId);
      } else {
        toast.error("인증번호가 일치하지 않습니다.");
        setEnteredCode("");
      }
    } catch (err) {
      toast.error("인증 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>학생 민원 관리 시스템</CardTitle>
          <CardDescription>
            {verificationStep === "email"
              ? "학교 계정으로 인증받기"
              : "인증번호를 입력해주세요"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verificationStep === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolId">학교 계정</Label>
                <Input
                  id="schoolId"
                  type="email"
                  placeholder="sdh123@sdh.hs.kr"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full"
                />
              </div>

              {!isTeacher && (
                <div className="space-y-2">
                  <Label htmlFor="userType">직위 선택</Label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="직위를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">학생</SelectItem>
                      <SelectItem value="council">학생회</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isTeacher && (
                <div className="space-y-2">
                  <Label>직위</Label>
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md border border-gray-200">
                    선생님
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full flex items-center justify-center space-x-2"
              >
                <Mail size={18} />
                <span>인증번호 받기</span>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="verificationCode" className="w-full block">
                  인증번호 입력
                </Label>

                <div className="flex justify-center w-full">
                  <InputOTP
                    maxLength={6}
                    value={enteredCode}
                    onChange={setEnteredCode}
                    className="mx-auto"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full flex items-center justify-center space-x-2"
              >
                <CheckCircle size={18} />
                <span>인증하기</span>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
