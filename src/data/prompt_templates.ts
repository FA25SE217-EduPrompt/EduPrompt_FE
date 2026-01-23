
export interface PromptTemplate {
    id: string;
    title: string;
    instruction: string;
    context: string;
    inputExample: string;
    outputFormat: string;
    constraints: string;
    categoryID: string;
    tags: {
        block: number;
        subject: string;
    }
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
    'Matrix': {
        id: 'matrix-001',
        title: 'Thiết kế ma trận đề (Bài 1)',
        instruction: `Thiết kế **một ma trận đề kiểm tra hoàn chỉnh** (45 phút, 1 tiết), đúng quy định hiện hành của Bộ GD&ĐT, bảo đảm **đánh giá được cả kiến thức và năng lực học sinh**. Ma trận cần thể hiện rõ: Cấu trúc ma trận đề (Nội dung/Mức độ), Yêu cầu phân bố mức độ nhận thức (30% NB, 40% TH, 30% VD), và Nội dung chi tiết cho mỗi ô.`,
        context: `Bạn là **giáo viên THPT tại Việt Nam**, am hiểu **Chương trình Giáo dục Phổ thông 2018**. Bài kiểm tra cho Môn Toán, Khối 10, Bài 27: THỰC HÀNH TÍNH XÁC SUẤT THEO ĐỊNH NGHĨA CỔ ĐIỂN. Mục tiêu đánh giá quy trình tính xác suất, sử dụng công cụ đại số tổ hợp, và giải quyết bài toán thực tế.`,
        inputExample: `Lớp 10A, trình độ Trung bình Khá. Hình thức: 10 câu Trắc nghiệm + 2 câu Tự luận. Ưu tiên đánh giá nhận diện công thức và tính xác suất có điều kiện.`,
        outputFormat: `Xuất kết quả dưới dạng **ma trận đề kiểm tra** (bảng) và **Thuyết minh ma trận**.`,
        constraints: `Tuân thủ GDPT 2018, không đưa kiến thức ngoài phạm vi, tỉ lệ hợp lý, ngôn ngữ chuẩn mực.`,
        categoryID: '2c5c6b29-354b-4cb7-bf35-9a498693a43d',
        tags: { block: 10, subject: 'Toán học' }
    },
    'Slide': {
        id: 'slide-001',
        title: 'Thiết kế slide (Bài 1)',
        instruction: `Thiết kế **một bộ slide bài giảng hoàn chỉnh** (dàn ý chi tiết) cho bài học, ngắn gọn, trực quan. Cấu trúc gồm 7 phần: Mở đầu, Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng, Củng cố, Dặn dò. Mỗi slide cần có Tiêu đề, Nội dung chính (gạch đầu dòng), và Ghi chú cho giáo viên.`,
        context: `Bạn là **giáo viên THPT tại Việt Nam**, giảng dạy theo **GDPT 2018**, thiết kế slide lấy học sinh làm trung tâm.`,
        inputExample: `Môn Toán, Khối 10, Bài 1: Mệnh đề. Thời lượng 2 tiết. Mục tiêu: Nhận diện mệnh đề, phủ định, kéo theo, đảo, kí hiệu .`,
        outputFormat: `Trình bày theo cấu trúc: Slide [Số]: [Tiêu đề] -> Nội dung -> Ghi chú GV.`,
        constraints: `Không chép nguyên văn SGK, không nhồi nhét chữ, tổng khoảng 30-40 slide, ngôn ngữ sư phạm.`,
        categoryID: 'df11bdfd-d114-41ee-b848-96c00dee04ba',
        tags: { block: 10, subject: 'Toán học' }
    },
    'Activity': {
        id: 'activity-001',
        title: 'Thiết kế hoạt động (Bài 1)',
        instruction: `Thiết kế **một hoạt động nhóm** tên "Thử thách logic: Ai đúng ai sai?". Nội dung gồm: Tên hoạt động, Mục tiêu, Nhiệm vụ học sinh, Cách tổ chức, Thời lượng, Sản phẩm học tập, Vai trò giáo viên, Đánh giá.`,
        context: `Bạn là **giáo viên THPT tại Việt Nam**, thiết kế hoạt động nhóm giúp học sinh chủ động chiếm lĩnh kiến thức về Mệnh đề.`,
        inputExample: `Bài 1: Mệnh đề. Thời lượng 20 phút. Lớp 40 HS, nhóm 4-6 HS. Có máy chiếu, bảng phụ.`,
        outputFormat: `Xuất kết quả theo cấu trúc 8 mục (Tên, Mục tiêu, Nhiệm vụ, Tổ chức, Thời lượng, Sản phẩm, Vai trò GV, Đánh giá).`,
        constraints: `Hoạt động thực tế, khả thi, không chép lại bài tập SGK, ngôn ngữ rõ ràng.`,
        categoryID: '0ff9c0aa-7271-4c45-9587-961126473aa8',
        tags: { block: 10, subject: 'Toán học' }
    },
    'Test': {
        id: 'test-001',
        title: 'Thiết kế bài kiểm tra (Bài 1)',
        instruction: `Thiết kế **một bộ tài liệu kiểm tra hoàn chỉnh** gồm 4 phần: A. Đề kiểm tra (Trắc nghiệm + Tự luận), B. Đáp án, C. Thang điểm, D. Rubric đánh giá.`,
        context: `Bạn là **giáo viên THPT tại Việt Nam**, thiết kế đề kiểm tra 1 tiết (45 phút) cho Bài 1: Mệnh đề. Ma trận: 7 điểm trắc nghiệm (10 câu), 3 điểm tự luận (2 câu).`,
        inputExample: `Lớp 10A, trình độ Trung bình Khá. Trắc nghiệm: nhận diện mệnh đề. Tự luận: mệnh đề chứa biến, lượng từ.`,
        outputFormat: `Xuất theo thứ tự: 1. ĐỀ KIỂM TRA, 2. ĐÁP ÁN, 3. THANG ĐIỂM, 4. RUBRIC ĐÁNH GIÁ.`,
        constraints: `Bám sát ma trận, không tự ý thay đổi tỉ lệ, đề/đáp án/thang điểm phải nhất quán.`,
        categoryID: '34145975-4c84-4510-a8b2-8b71a5e4d045',
        tags: { block: 10, subject: 'Toán học' }
    },
    'LessonPlan': {
        id: 'lesson-plan-001',
        title: 'Thiết kế giáo án (Bài 1)',
        instruction: `Thiết kế **một giáo án hoàn chỉnh** (không chép SGK). Gồm: 1. Mục tiêu (Kiến thức, Kĩ năng, Thái độ, Năng lực), 2. Chuẩn bị, 3. Tiến trình dạy học (4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng), 4. Hệ thống câu hỏi, 5. Kiểm tra đánh giá.`,
        context: `Bạn là **giáo viên THPT tại Việt Nam**, dạy học tích cực, phát triển phẩm chất năng lực.`,
        inputExample: `Môn Toán, Khối 10, Bài 1: Mệnh đề. Thời lượng 2 tiết.`,
        outputFormat: `Bản giáo án chi tiết 6 mục (Thông tin, Mục tiêu, Chuẩn bị, Tiến trình, Đánh giá, Rút kinh nghiệm).`,
        constraints: `Ngôn ngữ sư phạm, phân bổ thời lượng hợp lý, bám sát khung 2018, độ dài 3-4 trang A4.`,
        categoryID: 'b87de893-9dd8-427e-823b-b2e2046e21e8',
        tags: { block: 10, subject: 'Toán học' }
    }
};
