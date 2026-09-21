import PageHeader from '@/components/ui/PageHeader';
import { UserCircle, Mail, Phone, Building2, Shield } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Your account information and preferences." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar card */}
        <div className="eec-card flex flex-col items-center py-8">
          <div className="w-24 h-24 rounded-full bg-eec-primary flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">AD</span>
          </div>
          <h2 className="text-lg font-bold text-eec-text">Admin User</h2>
          <p className="text-sm text-slate-500 mt-0.5">System Administrator</p>
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-eec-accent/10 text-eec-accent ring-1 ring-eec-accent/20">
            <Shield className="w-3 h-3" /> Super Admin
          </span>
        </div>
        {/* Details card */}
        <div className="lg:col-span-2 eec-card">
          <h3 className="text-sm font-semibold text-eec-primary mb-4 pb-3 border-b border-slate-100">
            Account Details
          </h3>
          <dl className="space-y-4">
            {[
              { icon: UserCircle, label: 'Full Name',   value: 'Admin User'                         },
              { icon: Mail,       label: 'Email',        value: 'admin@eec.gov.et'                   },
              { icon: Phone,      label: 'Phone',        value: '+251 91 000 0000'                   },
              { icon: Building2,  label: 'Department',   value: 'Information Technology'             },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-eec-text">{value}</p>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
