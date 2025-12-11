
export interface TemplateQuestion {
    id: string;
    label: string; // The question text
    placeholder?: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[]; // For select type
}

export interface TemplateGroup {
    title: string;
    questions: TemplateQuestion[];
}

export interface Template {
    id: string;
    title: string;
    description: string;
    instruction: string;
    context: string;
    inputExample: string;
    outputFormat: string;
    constraints: string;
    questions?: {
        groupA: TemplateGroup; // "Clarify what teacher wants"
        groupB: TemplateGroup; // "Mandatory info"
    };
}

export const PROMPT_TEMPLATES: Record<string, Template> = {
    LessonPlan: {
        id: 'LessonPlan',
        title: 'Soạn Giáo Án Hoàn Chỉnh (LESSON PLAN)',
        description: 'Soạn giáo án chuẩn theo CT 2018 + CV 5512',
        instruction: "Bạn là chuyên gia thiết kế giáo án THPT theo Chương trình GDPT 2018 và Công văn 5512.\n\nNhiệm vụ: Soạn giáo án hoàn chỉnh cho bài học, theo định dạng chuyên nghiệp, gồm các phần: mục tiêu, năng lực, thiết bị, tiến trình dạy học, đánh giá, phụ lục.\nPhương pháp: gợi mở – vấn đáp, hoạt động nhóm, học sinh tự kiến tạo ≥70% kiến thức.",
        context: "Thông tin lớp học, sách giáo khoa, mức độ học sinh, yêu cầu cần đạt.",
        inputExample: "ten_bai: \"Mệnh đề và Tập hợp\"\nchuong: \"Chương 1\"\nsach_giao_khoa: \"KNTT\"\nlop: 10\ncap_do_lop: \"Lớp chất lượng cao\"\nso_tiet: \"2 tiết\"\nyeu_cau_can_dat:\n  - \"Nhận biết được khái niệm mệnh đề\"\n  - \"Phân biệt mệnh đề đúng sai\"\n  - \"Hiểu phép toán tập hợp\"",
        outputFormat: "Trang thông tin chung\n\nMục tiêu\n\nThiết bị dạy học\n\nTiến trình 4 hoạt động (Khởi động – Hình thành kiến thức – Luyện tập – Vận dụng)\n\nĐánh giá\n\nPhụ lục",
        constraints: "Ngôn ngữ chính thống\n\nPhải có câu hỏi gợi mở, phân hóa 4 mức độ\n\nKhông giảng quá 5 phút liên tục\n\nSản phẩm cụ thể mỗi hoạt động\n\nTuân thủ chuẩn đánh giá năng lực 4 mức",
        questions: {
            groupA: {
                title: "Danh sách câu hỏi để App gợi ý",
                questions: [
                    { id: 'q1', label: "Thầy/cô dạy môn gì?", type: 'text' },
                    { id: 'q2', label: "Lớp học (khối, chất lượng học sinh)?", type: 'text' },
                    { id: 'q3', label: "Sách giáo khoa sử dụng?", type: 'text' }
                ]
            },
            groupB: {
                title: "Thông tin chi tiết",
                questions: [
                    { id: 'q4', label: "Tên bài + số tiết?", type: 'text' },
                    { id: 'q5', label: "Yêu cầu cần đạt?", type: 'textarea' },
                    { id: 'q6', label: "Học sinh yếu — mạnh như thế nào?", type: 'textarea' },
                    { id: 'q7', label: "Muốn nhấn mạnh năng lực nào?", type: 'text' },
                    { id: 'q8', label: "Có yêu cầu về hoạt động nhóm không?", type: 'select', options: ['Có', 'Không'] },
                    { id: 'q9', label: "Có muốn gợi ý phiếu học tập?", type: 'select', options: ['Có', 'Không'] }
                ]
            }
        }
    },
    TestQuiz: {
        id: 'TestQuiz',
        title: 'Tạo Đề Kiểm Tra / Bài Kiểm Tra 15’ – 45’ (TEST/QUIZ)',
        description: 'Tạo đề kiểm tra chuẩn hóa, phân mức, có đáp án – ma trận',
        instruction: "Tạo đề kiểm tra theo chuẩn Bộ GD&ĐT, có ma trận + đáp án + thang điểm, đảm bảo phù hợp thời lượng.",
        context: "Thông tin bài học, mục tiêu kiểm tra, mức độ học sinh, dạng bài mong muốn.",
        inputExample: "khoi: 10\nmon: Toán\nthoi_luong: \"15 phút\"\nhinh_thuc: \"5 trắc nghiệm + 1 tự luận\"\nnoi_dung: \"Hàm số bậc nhất\"\nmuc_do_phan_bo:\n  nhan_biet: 30\n  thong_hieu: 40\n  van_dung: 20\n  van_dung_cao: 10",
        outputFormat: "Ma trận 4 mức\n\nĐề bài\n\nHướng dẫn chấm\n\nRubric\n\nFile đáp án ngắn gọn",
        constraints: "Các câu hỏi phải đảm bảo phân hóa\n\nGiọng văn trung tính, chính xác\n\nKhông vượt quá phạm vi chương trình",
        questions: {
            groupA: {
                title: "Danh sách câu hỏi để App gợi ý",
                questions: [
                    { id: 'q1', label: "Kiểm tra bao nhiêu phút?", type: 'text' },
                    { id: 'q2', label: "Số câu trắc nghiệm/tự luận?", type: 'text' },
                    { id: 'q3', label: "Nội dung cần kiểm tra?", type: 'textarea' }
                ]
            },
            groupB: {
                title: "Thông tin chi tiết",
                questions: [
                    { id: 'q4', label: "Tỷ lệ phân mức?", type: 'text', placeholder: "VD: 30-40-20-10" },
                    { id: 'q5', label: "Có muốn đề 2 mã khác nhau?", type: 'select', options: ['Có', 'Không'] }
                ]
            }
        }
    },
    Worksheet: {
        id: 'Worksheet',
        title: 'Tạo Hoạt Động Học Nhóm / Phiếu Học Tập',
        description: 'Giáo viên cần thiết kế hoạt động / worksheet cho HS',
        instruction: "Thiết kế phiếu học tập có mục tiêu – nhiệm vụ – sản phẩm – câu hỏi gợi mở theo CV 5512.",
        context: "Môn học, bài học, số lượng nhóm, mức độ lớp.",
        inputExample: "mon: Toán\nbai: \"Phương trình đường thẳng\"\nso_nhom: 6\nmuc_tieu: \"HS viết được phương trình tổng quát\"\ncap_do_lop: \"Trung bình\"",
        outputFormat: "Tiêu đề phiếu\n\nMục tiêu\n\nNhiệm vụ nhóm\n\nCâu hỏi dẫn dắt\n\nSản phẩm kỳ vọng\n\nTiêu chí đánh giá",
        constraints: "Ngôn ngữ ngắn gọn\n\nTối đa 1 trang A4\n\nCó gợi ý cho HS yếu",
        questions: {
            groupA: {
                title: "Danh sách câu hỏi để App gợi ý",
                questions: [
                    { id: 'q1', label: "Hoạt động này thuộc phần nào của bài học?", type: 'text' },
                    { id: 'q2', label: "Mục tiêu hoạt động?", type: 'textarea' },
                    { id: 'q3', label: "Muốn nhóm làm việc bao lâu?", type: 'text' }
                ]
            },
            groupB: {
                title: "Thông tin chi tiết",
                questions: [
                    { id: 'q4', label: "Kết quả sản phẩm là gì?", type: 'textarea' },
                    { id: 'q5', label: "Cần mức độ khó như thế nào?", type: 'select', options: ['Dễ', 'Trung bình', 'Khó'] }
                ]
            }
        }
    },
    Homework: {
        id: 'Homework',
        title: 'Tạo Bài Tập & Đáp Án (HOMEWORK / PRACTICE)',
        description: 'Tạo bài tập đa mức độ + lời giải chi tiết + phân hóa',
        instruction: "Tạo bộ bài tập có 4 mức độ: Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao.\nMỗi bài gồm đề – gợi ý – lời giải – đáp án.",
        context: "Chương, nội dung, số lượng bài, mục tiêu rèn luyện.",
        inputExample: "mon: Toán\nchuong: \"Vectơ\"\nnoi_dung: \"Tổng hai vectơ\"\nso_bai: 6\nyeu_cau: \"Phân hóa 4 mức độ rõ ràng\"",
        outputFormat: "Danh sách bài tập\n\nLời giải chi tiết\n\nGợi ý cho HS yếu\n\nBài nâng cao cho HS giỏi",
        constraints: "Không vượt chương trình\n\nBiểu thức toán phải rõ ràng\n\nLời giải mạch lạc",
        questions: {
            groupA: {
                title: "Danh sách câu hỏi để App gợi ý",
                questions: [
                    { id: 'q1', label: "Bao nhiêu bài?", type: 'text' },
                    { id: 'q2', label: "Mức độ khó mong muốn?", type: 'select', options: ['Cơ bản', 'Nâng cao', 'Hỗn hợp'] },
                    { id: 'q3', label: "Có muốn giải chi tiết hay gợi ý thôi?", type: 'select', options: ['Giải chi tiết', 'Gợi ý', 'Cả hai'] }
                ]
            },
            groupB: {
                title: "Thông tin chi tiết",
                questions: [
                    { id: 'q4', label: "Có cần bài nâng cao không?", type: 'select', options: ['Có', 'Không'] }
                ]
            }
        }
    },
    ReviewMindmap: {
        id: 'ReviewMindmap',
        title: 'Tạo Đề Cương Ôn Tập / Mindmap / Tóm Tắt Bài',
        description: 'Tóm tắt bài học thành đề cương chi tiết',
        instruction: "Tạo đề cương ôn tập gồm: tóm tắt lý thuyết, công thức, bài tập ví dụ, sơ đồ tư duy.",
        context: "Tên chương, mục tiêu ôn tập, mức độ học sinh.",
        inputExample: "mon: Toán 10\nchuong: \"Hàm số\"\nyeu_cau: \"Tóm tắt dễ hiểu cho HS trung bình – khá\"\nkieu_trinh_bay: \"Mindmap + lý thuyết + ví dụ mẫu\"",
        outputFormat: "Lý thuyết trọng tâm\n\nCông thức cần nhớ\n\nSơ đồ tư duy dạng text\n\nVí dụ minh họa\n\nBài tập tự luyện",
        constraints: "Ngắn gọn\n\nKhông lan man\n\nPhải có ví dụ mẫu",
        questions: {
            groupA: {
                title: "Danh sách câu hỏi để App gợi ý",
                questions: [
                    { id: 'q1', label: "Chương/bài nào?", type: 'text' },
                    { id: 'q2', label: "Muốn tóm tắt theo dạng mindmap hay bullet?", type: 'select', options: ['Mindmap', 'Bullet Points'] }
                ]
            },
            groupB: {
                title: "Thông tin chi tiết",
                questions: [
                    { id: 'q3', label: "Học sinh mức độ nào?", type: 'select', options: ['Yếu', 'Trung bình', 'Khá', 'Giỏi'] },
                    { id: 'q4', label: "Có cần ví dụ mẫu?", type: 'select', options: ['Có', 'Không'] }
                ]
            }
        }
    },
    Rewrite: {
        id: 'Rewrite',
        title: 'Chuyển Đổi Ngôn Ngữ / Rewrite Chuyên Môn',
        description: 'Dịch/Viết lại nội dung chuyên môn theo phong cách sư phạm',
        instruction: "Viết lại nội dung theo phong cách sư phạm: dễ hiểu, chính xác, phù hợp THPT.",
        context: "Nội dung gốc, đối tượng học sinh.",
        inputExample: "noi_dung: \"Định nghĩa đạo hàm...\"\ndoi_tuong: \"HS khá giỏi\"\nyeu_cau: \"Viết lại sao cho trực quan hơn\"",
        outputFormat: "Bản viết lại\n\nGiải thích dễ hiểu\n\nVí dụ minh họa\n\nGợi ý trực quan",
        constraints: "Không được sai kiến thức\n\nKhông được rút gọn quá mức",
        questions: {
            groupA: {
                title: "Danh sách câu hỏi để App gợi ý",
                questions: [
                    { id: 'q1', label: "Nội dung cần viết lại?", type: 'textarea' },
                    { id: 'q2', label: "Viết cho đối tượng học sinh nào?", type: 'text' }
                ]
            },
            groupB: {
                title: "Thông tin chi tiết",
                questions: [
                    { id: 'q3', label: "Muốn phong cách: chính thống – thân thiện – đơn giản hóa?", type: 'select', options: ['Chính thống', 'Thân thiện', 'Đơn giản hóa'] }
                ]
            }
        }
    }
};
