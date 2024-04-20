import type {HydrogenComponentSchema} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import {Form} from '@remix-run/react';

import {Button, Input} from '~/components';

let ContactForm = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} {...props} className="bg-gray-200">
      <Form
        action="/contact"
        method="POST"
        encType="multipart/form-data"
        navigate={false}
        className="w-80 mx-auto p-4 text-center"
      >
        <div className="space-y-2">
          <label className="text-2xl font-medium">Contact us</label>
          <p className="">Let us know if you have any question</p>
        </div>
        <div className="space-y-2 mt-8 mb-5">
          <Input type="text" name="name" label="Name" placeholder="Name" />
          <Input type="email" name="email" label="Email" placeholder="Email" />
          <Input
            type="text"
            name="subject"
            label="Subject"
            placeholder="Subject"
          />
          <textarea
            className="resize-none w-full p-2.5 border rounded-sm focus-visible:outline-none focus:border-bar/50 border-bar/10"
            rows={4}
            name="message"
            placeholder="Message"
          />
        </div>
        <Button type="submit">Send</Button>
      </Form>
    </div>
  );
});

export default ContactForm;

export let schema: HydrogenComponentSchema = {
  type: 'contact-form',
  title: 'Contact form',
  limit: 1,
  enabledOn: {
    pages: ['INDEX'],
  },
  inspector: [
    // {
    //   group: 'Contact form',
    //   inputs: [],
    // },
  ],
};
