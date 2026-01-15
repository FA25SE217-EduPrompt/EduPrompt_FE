export type CurriculumNode = {
    id: string;
    title: string;
    type: 'subject' | 'semester' | 'chapter' | 'lesson';
    children?: CurriculumNode[];
};

export const curriculumData: Record<string, CurriculumNode[]> = {
    '10': [
        {
            id: 'math-10',
            title: 'Toán học',
            type: 'subject',
            children: [
                {
                    id: 'math-10-sem1',
                    title: 'Học kỳ I',
                    type: 'semester',
                    children: [
                        {
                            id: 'math-10-ch1',
                            title: 'Chương 1: Mệnh đề toán học',
                            type: 'chapter',
                            children: [
                                { id: 'math-10-l1', title: 'Bài 1: Mệnh đề', type: 'lesson' },
                                { id: 'math-10-l2', title: 'Bài 2: Tập hợp', type: 'lesson' },
                                { id: 'math-10-l3', title: 'Bài 3: Các phép toán trên tập hợp', type: 'lesson' }
                            ]
                        },
                        {
                            id: 'math-10-ch2',
                            title: 'Chương 2: Bất phương trình',
                            type: 'chapter',
                            children: [
                                { id: 'math-10-l4', title: 'Bài 1: Bất phương trình bậc nhất hai ẩn', type: 'lesson' },
                                { id: 'math-10-l5', title: 'Bài 2: Hệ bất phương trình bậc nhất hai ẩn', type: 'lesson' }
                            ]
                        }
                    ]
                },
                {
                    id: 'math-10-sem2',
                    title: 'Học kỳ II',
                    type: 'semester',
                    children: [
                        {
                            id: 'math-10-ch6',
                            title: 'Chương 6: Hàm số, đồ thị và ứng dụng',
                            type: 'chapter',
                            children: [
                                { id: 'math-10-l15', title: 'Bài 1: Hàm số', type: 'lesson' },
                                { id: 'math-10-l16', title: 'Bài 2: Hàm số bậc hai', type: 'lesson' }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'lit-10',
            title: 'Ngữ văn',
            type: 'subject',
            children: [
                {
                    id: 'lit-10-sem1',
                    title: 'Học kỳ I',
                    type: 'semester',
                    children: [
                        {
                            id: 'lit-10-ch1',
                            title: 'Sức hấp dẫn của truyện kể',
                            type: 'chapter',
                            children: [
                                { id: 'lit-10-l1', title: 'Truyện về các vị thần sáng tạo thế giới', type: 'lesson' },
                                { id: 'lit-10-l2', title: 'Tản viên từ phán sự lục', type: 'lesson' }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    '11': [
        {
            id: 'math-11',
            title: 'Toán học',
            type: 'subject',
            children: []
        }
    ],
    '12': [
        {
            id: 'math-12',
            title: 'Toán học',
            type: 'subject',
            children: []
        }
    ]
};
