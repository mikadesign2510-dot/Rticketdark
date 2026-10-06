import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  X, 
  Sparkles, 
  Send,
  Building,
  DollarSign,
  Download,
  FileText,
  Award,
  Scale
} from 'lucide-react';
import { EventProposal, ProposalStatus, ProposalDocument } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';

interface EventProposalsTabProps {
  proposals: EventProposal[];
  onSaveProposal: (proposal: Partial<EventProposal>) => Promise<void>;
  onDeleteProposal: (id: string) => Promise<void>;
  onApproveAndPublish: (id: string) => Promise<string>;
}

export const EventProposalsTab: React.FC<EventProposalsTabProps> = ({
  proposals,
  onSaveProposal,
  onDeleteProposal,
  onApproveAndPublish,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProposalStatus>('all');
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<EventProposal | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isPublishingId, setIsPublishingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ProposalDocument | null>(null);

  // Filtered proposals
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.eventTitle.toLowerCase().includes(q);
      const matchProducer = p.producerName.toLowerCase().includes(q);
      const matchTracking = p.trackingCode.toLowerCase().includes(q);
      const matchPhone = p.phoneNumber.includes(q);
      const matchVenue = p.proposedVenue.toLowerCase().includes(q);
      if (!matchTitle && !matchProducer && !matchTracking && !matchPhone && !matchVenue) return false;
    }
    return true;
  });

  // KPIs
  const totalCount = proposals.length;
  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const publishedCount = proposals.filter(p => p.status === 'published').length;

  const handlePublish = async (propId: string) => {
    if (!confirm('آیا از تایید نهایی و انتشار مستقیم این رویداد روی گیشه سایت اطمینان دارید؟')) return;
    setIsPublishingId(propId);
    try {
      const newEventId = await onApproveAndPublish(propId);
      alert(`رویداد با موفقیت تایید و با شناسه ${newEventId} روی گیشه منتشر شد!`);
      if (selectedProposalForDetail?.id === propId) {
        setSelectedProposalForDetail(null);
      }
    } catch (e) {
      console.error(e);
      alert('خطا در انتشار رویداد.');
    } finally {
      setIsPublishingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل درخواست‌های ایجاد رویداد</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-slate-900">
            {toPersianDigits(totalCount)} <span className="text-xs font-normal text-slate-500">درخواست</span>
          </div>
          <div className="text-[11px] text-slate-500">
            دریافتی از تهیه‌کنندگان و کارگردانان
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>در انتظار بررسی و تصمیم</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-amber-600">
            {toPersianDigits(pendingCount)} <span className="text-xs font-normal text-slate-500">مورد جدید</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold">
            نیازمند بررسی مجوز و زمان‌بندی
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>تایید اولیه و در حال انعقاد</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-purple-600">
            {toPersianDigits(approvedCount)} <span className="text-xs font-normal text-slate-500">اثر</span>
          </div>
          <div className="text-[11px] text-purple-700 font-bold">
            آماده انتشار نهایی روی گیشه
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>منتشر شده روی گیشه فعال</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-emerald-600">
            {toPersianDigits(publishedCount)} <span className="text-xs font-normal text-slate-500">رویداد</span>
          </div>
          <div className="text-[11px] text-slate-500">
            در حال بلیت‌فروشی آنلاین
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64 sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با عنوان رویداد، نام متقاضی، کد رهگیری..."
              className="w-full py-2.5 pr-9 pl-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF3366]/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              همه ({toPersianDigits(totalCount)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'pending' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              در انتظار ({toPersianDigits(pendingCount)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'approved' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تایید اولیه ({toPersianDigits(approvedCount)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'published' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              منتشر شده ({toPersianDigits(publishedCount)})
            </button>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3.5 pr-4">کد رهگیری و تاریخ</th>
                <th className="py-3.5">عنوان اثر و دسته‌بندی</th>
                <th className="py-3.5">صاحب اثر / تهیه‌کننده</th>
                <th className="py-3.5">سالن و شهر</th>
                <th className="py-3.5">کف قیمت برآوردی</th>
                <th className="py-3.5">وضعیت درخواست</th>
                <th className="py-3.5 text-center">عملیات و داوری</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Tracking Code & Date */}
                  <td className="py-3.5 pr-4">
                    <span className="font-mono font-bold text-[#FF3366] block" dir="ltr">{prop.trackingCode}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{prop.createdAt}</span>
                  </td>

                  {/* Title & Category */}
                  <td className="py-3.5">
                    <span className="font-display font-black text-slate-900 block">{prop.eventTitle}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-500">
                        {prop.categoryLabel}
                      </span>
                      {(prop.documents?.length || 0) > 0 && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold inline-flex items-center gap-1">
                          <FileCheck2 className="w-3 h-3" />
                          <span>{toPersianDigits(prop.documents?.length || 0)} مدرک</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Producer */}
                  <td className="py-3.5">
                    <span className="font-bold text-slate-800 block">{prop.producerName}</span>
                    <span className="text-[10px] text-slate-500 block">{prop.producerRole}</span>
                    <span className="text-[10px] text-slate-400 font-mono block" dir="ltr">{prop.phoneNumber}</span>
                  </td>

                  {/* Venue & City */}
                  <td className="py-3.5">
                    <span className="font-bold text-slate-800 block">{prop.proposedVenue}</span>
                    <span className="text-[10px] text-slate-500 block">{prop.city}</span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 font-sans font-bold text-emerald-600">
                    {toPersianDigits(prop.estimatedPriceFrom)} هزار تومان
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5">
                    {prop.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        در انتظار بررسی
                      </span>
                    )}
                    {prop.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3" />
                        تایید اولیه
                      </span>
                    )}
                    {prop.status === 'published' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        منتشر شده در گیشه
                      </span>
                    )}
                    {prop.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3" />
                        رد شده
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* One click publish if not published */}
                      {prop.status !== 'published' ? (
                        <button
                          type="button"
                          onClick={() => handlePublish(prop.id)}
                          disabled={isPublishingId === prop.id}
                          className="py-1 px-3 rounded-lg bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-[11px] font-bold shadow-2xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="تایید و انتشار مستقیم روی گیشه رویدادها"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>انتشار در گیشه</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          روی گیشه فعال
                        </span>
                      )}

                      {/* View Detail */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProposalForDetail(prop);
                          setAdminNoteInput(prop.adminNotes || '');
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                        title="مشاهده جزئیات کامل درخواست"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از حذف درخواست «${prop.eventTitle}» اطمینان دارید؟`)) {
                            onDeleteProposal(prop.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                        title="حذف درخواست"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Detail & Review Modal */}
      {selectedProposalForDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto" dir="rtl">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF3366]" dir="ltr">
                  {selectedProposalForDetail.trackingCode}
                </span>
                <h3 className="font-display font-black text-base text-slate-900">
                  {selectedProposalForDetail.eventTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposalForDetail(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pl-1">
              {/* Producer Info Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">صاحب اثر / متقاضی:</span>
                  <span className="font-bold text-slate-900">{selectedProposalForDetail.producerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">سمت:</span>
                  <span className="font-bold text-slate-900">{selectedProposalForDetail.producerRole}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">شماره تماس:</span>
                  <span className="font-mono font-bold text-slate-900" dir="ltr">{selectedProposalForDetail.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">پست الکترونیک:</span>
                  <span className="font-mono text-slate-700" dir="ltr">{selectedProposalForDetail.email || '—'}</span>
                </div>
                {selectedProposalForDetail.companyOrGroup && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">موسسه / گروه:</span>
                    <span className="font-bold text-slate-900">{selectedProposalForDetail.companyOrGroup}</span>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">محل و سالن پیشنهادی:</span>
                    <span className="font-bold text-slate-900">{selectedProposalForDetail.proposedVenue} ({selectedProposalForDetail.city})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">بازه زمانی:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedProposalForDetail.proposedStartDate} تا {selectedProposalForDetail.proposedEndDate || 'نامشخص'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">کف قیمت برآوردی بلیت:</span>
                    <span className="font-bold text-emerald-600">{toPersianDigits(selectedProposalForDetail.estimatedPriceFrom)} هزار تومان</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">برآورد ظرفیت هر سانس:</span>
                    <span className="font-bold text-slate-900">{toPersianDigits(selectedProposalForDetail.estimatedCapacity || 0)} نفر</span>
                  </div>
                </div>

                {selectedProposalForDetail.proposedTimeSlots && selectedProposalForDetail.proposedTimeSlots.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1">سانس‌های پیشنهادی:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProposalForDetail.proposedTimeSlots.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProposalForDetail.description && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-0.5 font-bold">خلاصه داستان و معرفی اثر:</span>
                    <p className="text-slate-700 leading-relaxed">{selectedProposalForDetail.description}</p>
                  </div>
                )}

                {selectedProposalForDetail.castAndCrewSummary && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-0.5 font-bold">عوامل و هنرمندان:</span>
                    <p className="text-slate-700">{selectedProposalForDetail.castAndCrewSummary}</p>
                  </div>
                )}

                {selectedProposalForDetail.licenseCode && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-0.5 font-bold">شماره مجوز ارشاد:</span>
                    <span className="font-mono text-slate-800 font-bold" dir="ltr">{selectedProposalForDetail.licenseCode}</span>
                  </div>
                )}
              </div>

              {/* Uploaded Licenses & Official Documents Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#FF3366]" />
                    <span className="font-bold text-slate-900 text-xs">
                      مدارک و مجوزهای رسمی بارگذاری‌شده ({(selectedProposalForDetail.documents || []).length} سند)
                    </span>
                  </div>

                  {selectedProposalForDetail.termsAccepted && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>قوانین حقوقی تایید شده ({selectedProposalForDetail.termsAcceptedDate || 'بله'})</span>
                    </span>
                  )}
                </div>

                {(selectedProposalForDetail.documents && selectedProposalForDetail.documents.length > 0) ? (
                  <div className="space-y-2">
                    {selectedProposalForDetail.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{doc.typeLabel}</span>
                            {doc.licenseNumber && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold" dir="ltr">
                                {doc.licenseNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm">
                            {doc.fileName} {doc.fileSize && <span className="font-sans">({doc.fileSize})</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#FF3366]" />
                            <span>مشاهده سند</span>
                          </button>

                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={doc.fileName || 'license_document'}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>دانلود</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>هیچ فایلی همراه با این درخواست بارگذاری نشده است. می‌توانید شماره مجوز را از متقاضی استعلام فرمایید.</span>
                  </div>
                )}

                {selectedProposalForDetail.nationalCode && (
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>کدملی / شناسه ملی نماینده ثبت‌کننده:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedProposalForDetail.nationalCode}</span>
                  </div>
                )}
              </div>

              {/* Admin Review & Decision Controls */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <span className="font-bold text-xs text-amber-900 block">داوری و تعیین وضعیت درخواست:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { st: 'pending', label: 'در انتظار بررسی' },
                    { st: 'under_review', label: 'در حال بررسی مدارک' },
                    { st: 'approved', label: 'تایید اولیه (Approved)' },
                    { st: 'rejected', label: 'رد درخواست' },
                  ].map((btn) => (
                    <button
                      key={btn.st}
                      type="button"
                      onClick={async () => {
                        await onSaveProposal({
                          ...selectedProposalForDetail,
                          status: btn.st as ProposalStatus,
                          adminNotes: adminNoteInput,
                        });
                        setSelectedProposalForDetail({
                          ...selectedProposalForDetail,
                          status: btn.st as ProposalStatus,
                          adminNotes: adminNoteInput,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedProposalForDetail.status === btn.st
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-bold text-amber-950">یادداشت کارشناس و گیشه (پنهان از کاربر):</label>
                  <textarea
                    rows={2}
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="نتایج استعلام سالن، درصد سهم توافقی، مجوزها..."
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-slate-900 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setSelectedProposalForDetail(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                بستن
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onSaveProposal({
                      ...selectedProposalForDetail,
                      adminNotes: adminNoteInput,
                    });
                    alert('یادداشت‌های کارشناسی ذخیره شدند.');
                  }}
                  className="py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  ذخیره یادداشت
                </button>

                {selectedProposalForDetail.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => handlePublish(selectedProposalForDetail.id)}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تایید و انتشار مستقیم روی گیشه</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document File Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#FF3366] block">{previewDoc.typeLabel}</span>
                <h4 className="font-display font-black text-sm text-slate-900 mt-0.5">{previewDoc.fileName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document display view */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden max-h-[60vh] flex items-center justify-center p-4">
              {previewDoc.fileUrl.startsWith('data:image') || previewDoc.fileUrl.includes('images.unsplash.com') || previewDoc.fileName.endsWith('.jpg') || previewDoc.fileName.endsWith('.png') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[55vh] object-contain rounded-xl shadow-sm"
                />
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">{previewDoc.fileName}</h5>
                    <p className="text-xs text-slate-500 font-mono mt-1">حجم فایل: {previewDoc.fileSize || 'نامشخص'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500">
                {previewDoc.licenseNumber && (
                  <span>شماره استعلام: <strong className="font-mono text-slate-800">{previewDoc.licenseNumber}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                >
                  بستن
                </button>

                {previewDoc.fileUrl && (
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={previewDoc.fileName}
                    className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود مستقیم فایل</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
