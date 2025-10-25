<div align="center">
  <img src="public/icons/192.png" alt="Worship Flow Logo" width="120">
  <h1>Worship Flow (ระบบจัดการทีมนมัสการ)</h1>
  <p>เว็บแอปพลิเคชันสำหรับช่วยวางแผนและจัดการทีมนมัสการสำหรับคริสตจักร</p>
</div>

---

**Worship Flow** เป็น Progressive Web App (PWA) ที่ถูกสร้างขึ้นเพื่อเพิ่มประสิทธิภาพในการจัดการการนมัสการ ตั้งแต่การวางแผนเพลง, การจัดทีม, ไปจนถึงการสื่อสารภายในทีม ทำให้ทุกคนทำงานร่วมกันได้อย่างราบรื่น

## ✨ คุณสมบัติหลัก (Features)

- **การจัดการ Service:** สร้างและวางแผนลำดับการนมัสการสำหรับแต่ละสัปดาห์
- **คลังเพลง (Song Library):** จัดการรายชื่อเพลง, คอร์ด, และเนื้อเพลงทั้งหมดในที่เดียว
- **การจัดการทีม (Team Management):** จัดตารางและมอบหมายหน้าที่ให้กับสมาชิกในทีม (นักร้อง, นักดนตรี, มีเดีย)
- **การแจ้งเตือน:** ระบบแจ้งเตือนเมื่อมีการมอบหมายหน้าที่ใหม่หรือมีการเปลี่ยนแปลง
- **ทำงานแบบออฟไลน์:** สามารถเข้าถึงข้อมูลสำคัญได้แม้ไม่มีการเชื่อมต่ออินเทอร์เน็ต (PWA)
- **Responsive Design:** รองรับการใช้งานบนทุกอุปกรณ์ ทั้งคอมพิวเตอร์, แท็บเล็ต, และโทรศัพท์มือถือ

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** [Next.js](https://nextjs.org/) - React framework for production
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **State Management:** React Context / Zustand (TBD)
- **PWA:** `next-pwa`

## 🛠️ เริ่มต้นใช้งาน (Getting Started)

ทำตามขั้นตอนต่อไปนี้เพื่อติดตั้งและรันโปรเจกต์บนเครื่องของคุณ

### 1. ข้อกำหนดเบื้องต้น (Prerequisites)

- Node.js (แนะนำเวอร์ชัน LTS)
- pnpm (หรือ npm/yarn)

### 2. การติดตั้ง (Installation)

1.  Clone a a repo
    ```bash
    git clone https://github.com/your-username/pcac-worship.git
    cd pcac-worship
    ```
2.  ติดตั้ง Dependencies
    ```bash
    pnpm install
    ```
3.  ตั้งค่า Environment Variables
    สร้างไฟล์ `.env.local` จากตัวอย่าง `.env.example` และใส่ข้อมูล Firebase project ของคุณ

    ```bash
    cp .env.example .env.local
    ```

    จากนั้นเข้าไปแก้ไขค่าต่างๆ ในไฟล์ `.env.local`

4.  รัน Development Server
    ```bash
    pnpm dev
    ```
    เปิดเบราว์เซอร์ไปที่ http://localhost:3000

## 📜 คำสั่งที่ใช้งานได้ (Available Scripts)

- `pnpm dev`: รันแอปพลิเคชันใน development mode
- `pnpm build`: build แอปพลิเคชันสำหรับ production
- `pnpm start`: รัน production build
- `pnpm lint`: รัน ESLint เพื่อตรวจสอบคุณภาพโค้ด
