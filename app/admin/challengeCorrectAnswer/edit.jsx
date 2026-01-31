import {
    Edit,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    BooleanInput,
    required,
} from "react-admin";

export const ChallengeCorrectAnswerEdit = () => {
    // Fixed: Moved validate prop to SelectInput child component
    return (
        <Edit>
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
                />
                <BooleanInput
                    source="isCaseSensitive"
                    label="Case Sensitive"
                    defaultValue={false}
                />
            </SimpleForm>
        </Edit>
    );
};
