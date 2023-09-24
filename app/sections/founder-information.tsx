import type {
    HydrogenComponentProps,
    HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
interface InfoProps extends HydrogenComponentProps {
    heading: string;
    subheading: string;
    authorImage: string;
    description: string;
    fullname: string;
    age: string
}

let infoFounder = forwardRef<HTMLElement, InfoProps>((props, ref) => {
    let { heading, subheading, authorImage, description, fullname, age, ...rest } = props;
    return (
        <section className='' ref={ref} {...rest}>
            <div className='text-center mb-3'>
                <h1 className='text-3xl font-bold'>{heading}</h1>
                <p>{subheading}</p>
            </div>
            <div className='flex items-center justify-center'>
                <img className='h-[300px] w-[300px] rounded-full mr-3' src={authorImage} alt="" />
                <div className='text-center'>
                    <p>Full Name: <b>{fullname}</b></p>
                    <p>Age: <b>{age}</b></p>
                    <p>mission & vision: <em>{description}</em></p>
                </div>
            </div>
        </section>
    );
});

export default infoFounder;

export let schema: HydrogenComponentSchema = {
    type: 'information',
    title: 'founder information',
    presets: [
        {
            name: 'founder information'
        }
    ],
    inspector: [
        {
            group: 'founder information',
            inputs: [
                {
                    type: 'text',
                    name: 'heading',
                    label: 'Heading',
                    defaultValue: 'Founder information',
                    placeholder: 'Founder information',
                },
                {
                    type: 'text',
                    name: 'subheading',
                    label: 'Sub heading',
                    defaultValue: 'Give customers details about the banner image(s) or content on the template.',
                },
                {
                    type: 'text',
                    name: 'fullname',
                    label: 'Fullname',
                    defaultValue: 'Đặng Ngọc Thắng'
                },
                {
                    type: 'text',
                    name: 'age',
                    label: 'Age',
                    defaultValue: '23'
                },
                {
                    type: 'image',
                    name: 'authorImage',
                    label: 'Author image',
                    defaultValue:
                        'https://cdn.shopify.com/s/files/1/0728/0410/6547/files/wv-fashion-model-in-fur.jpg?v=1694236467',
                },
                {
                    type: 'textarea',
                    name: 'description',
                    label: 'Description',
                    defaultValue: `Watch these short videos to see our products in action.`,
                    placeholder: 'description',
                }
            ],
        },
    ],
};