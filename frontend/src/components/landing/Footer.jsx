const footerLinks = {
  Modules: [
    { label: 'Dashboard', href: '#' },
    { label: 'Employees', href: '#' },
    { label: 'Attendance', href: '#' },
    { label: 'Time Off', href: '#' },
    { label: 'Payroll', href: '#' },
    { label: 'Reports', href: '#' },
  ],
  Features: [
    { label: 'Role Management', href: '#' },
    { label: 'Attendance Tracking', href: '#' },
    { label: 'Leave Management', href: '#' },
    { label: 'Payroll Processing', href: '#' },
    { label: 'Reports & Analytics', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'API Docs', href: '#' },
  ],
  Company: [
    { label: 'About EmPay', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-on-dark py-16">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <span className="font-cal text-xl text-on-dark tracking-tight">EmPay</span>
            <p className="text-body-sm text-on-dark-soft leading-relaxed">
              Smart Human Resource Management System. Empowering HR teams with precision and clarity.
            </p>
            <p className="text-caption text-on-dark-soft mt-4">
              © {new Date().getFullYear()} EmPay. All rights reserved.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <span className="text-title-sm text-on-dark">{category}</span>
              <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
