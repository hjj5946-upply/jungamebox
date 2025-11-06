import MainLayout from "../layouts/MainLayout";

export default function Contact() {
  return (
    <MainLayout>
      <section className="space-y-3 text-slate-100 text-sm leading-7">
        <h1 className="text-lg font-semibold">Contact</h1>
        <p>문의: <a className="underline hover:text-slate-200" href="mailto:contact@jun-gamebox.com">contact@jun-gamebox.com</a></p>
      </section>
    </MainLayout>
  );
}
