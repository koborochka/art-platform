export const activityOptions = [
    { id: 'merch', label: 'Авторский мерч (полиграфия, стикеры, брелоки...)' },
    { id: 'toys', label: 'Игрушки ручной работы (вязанные, смешанной техники...)' },
    { id: 'accessories', label: 'Аксессуары ручной работы (серьги, кольца, браслеты...)' },
    { id: 'decor', label: 'Посуда и декор ручной работы (керамика, гипс...)' },
    { id: 'perfume', label: 'Парфюмерия и свечи ручной работы' },
    { id: 'other', label: 'Другое' },
];

export const shelfOptions = [
    { id: '6', label: '6 уровень (верхняя полка) - 1100 р.' },
    { id: '5', label: '5 уровень (верхний уровень глаз) - 2500 р.' },
    { id: '4', label: '4 уровень (нижний уровень глаз) - 2500 р.' },
    { id: '3', label: '3 уровень (средняя полка) - 1500 р.' },
    { id: '2', label: '2 уровень (нижняя полка) - 1100 р.' },
    { id: '1', label: '1 уровень (нижняя полка) - 900 р.' },
];

export const labelById = (options: { id: string; label: string }[], ids: string[]) =>
    ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join('\n  - ');
