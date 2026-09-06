import { SearchIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';

interface ISearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Найти товар' }: ISearchBarProps) {
    return (
        <InputGroup>
            <InputGroupInput value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            <InputGroupAddon>
                <SearchIcon className="text-zinc-900" />
            </InputGroupAddon>
        </InputGroup>
    );
}
