import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useDiagram } from '@/api/catalog';
import { DiagramBlock } from '@/components/catalog/DiagramBlock';

export default function DiagramPage(): ReactElement {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useDiagram(slug);

  if (isLoading) return <Page>{t('catalog.loading')}</Page>;
  if (isError || !data) return <Page>{t('catalog.empty')}</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-semibold">{data.title}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('catalog.diagram.helper')}</p>
      <div className="mt-6">
        <DiagramBlock diagram={data} />
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }): ReactElement {
  return <main className="container mx-auto px-4 py-10">{children}</main>;
}
