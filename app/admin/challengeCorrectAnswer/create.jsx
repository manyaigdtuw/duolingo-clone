import {
    Create,
    ReferenceInput,
    SimpleForm,
    TextInput,
    BooleanInput,
    required,
    SelectInput, // Added SelectInput import
} from "react-admin";

export const ChallengeCorrectAnswerCreate = () => {
    // Fixed: Moved validate prop to SelectInput child component
    return (
        <Create>
            <SimpleForm>
                <ReferenceInput
                    source="challengeId"
                    reference="challenges"
                    label="Challenge"
                >
                    <SelectInput optionText="question" validate={[required()]} />
                </ReferenceInput>
                <TextInput
                    source="answer"
                    validate={[required()]}
                    label="Correct Answer"
                    helperText="Enter one correct answer (you can add multiple answers by creating multiple entries)"
                />
                <BooleanInput
                    source="isCaseSensitive"
                    label="Case Sensitive"
                    defaultValue={false}
                    helperText="Check if the answer should be case-sensitive"
                />
            </SimpleForm>
        </Create>
    );
};
