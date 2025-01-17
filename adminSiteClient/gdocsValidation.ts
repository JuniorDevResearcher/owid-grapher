import {
    OwidArticleContent,
    OwidArticleType,
    OwidArticleErrorMessage,
    OwidArticleErrorMessageType,
} from "@ourworldindata/utils"

interface Handler {
    setNext: (handler: Handler) => Handler
    handle: (gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) => null
}

abstract class AbstractHandler implements Handler {
    #nextHandler: Handler | null = null

    setNext(handler: Handler) {
        this.#nextHandler = handler
        return handler
    }

    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        if (this.#nextHandler) return this.#nextHandler.handle(gdoc, messages)
        return null
    }
}

class BodyHandler extends AbstractHandler {
    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        const { body } = gdoc.content
        if (!body) {
            messages.push(getMissingContentPropertyError("body"))
        }

        return super.handle(gdoc, messages)
    }
}

class TitleHandler extends AbstractHandler {
    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        const { title } = gdoc.content
        if (!title) {
            messages.push(getMissingContentPropertyError("title"))
        }

        return super.handle(gdoc, messages)
    }
}

class SlugHandler extends AbstractHandler {
    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        const { slug } = gdoc
        if (!slug) {
            messages.push({
                property: "slug",
                type: OwidArticleErrorMessageType.Error,
                message: `Missing slug`,
            })
        } else if (!slug.match(/^[a-z0-9-]+$/)) {
            messages.push({
                property: "slug",
                type: OwidArticleErrorMessageType.Error,
                message: `Slug must only contain lowercase letters, numbers and hyphens`,
            })
        }

        return super.handle(gdoc, messages)
    }
}

class PublishedAtHandler extends AbstractHandler {
    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        const { publishedAt } = gdoc
        if (!publishedAt) {
            messages.push({
                property: "publishedAt",
                type: OwidArticleErrorMessageType.Warning,
                message: `The publication date will be set to the current date on publishing.`,
            })
        }

        return super.handle(gdoc, messages)
    }
}

export class ExcerptHandler extends AbstractHandler {
    static maxLength = 150
    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        const { excerpt } = gdoc.content
        if (!excerpt) {
            messages.push(getMissingContentPropertyError("excerpt"))
        } else if (excerpt.length > ExcerptHandler.maxLength) {
            messages.push({
                property: "excerpt",
                type: OwidArticleErrorMessageType.Warning,
                message: `Long excerpts may not display well in our list of articles or on social media.`,
            })
        }

        return super.handle(gdoc, messages)
    }
}

export class AttachmentsHandler extends AbstractHandler {
    handle(gdoc: OwidArticleType, messages: OwidArticleErrorMessage[]) {
        // These errors come from the server and we can't currently easily match them to their origin
        // So instead we just render them all on the settings drawer
        gdoc.errors?.forEach((error) => messages.push(error))
        return super.handle(gdoc, messages)
    }
}

// #gdocsvalidation Errors prevent saving published articles. Errors are only
// raised in front-end admin code at the moment (search for
// #gdocsvalidationclient in codebase), but should ultimately be performed in
// server code too (see #gdocsvalidationserver). The checks performed here
// should match the list of required fields in OwidArticleTypePublished and
// OwidArticleContentPublished types, so that gdocs coming from the DB effectively
// honor the type cast (and subsequent assumptions) in getPublishedGdocs()
export const getErrors = (gdoc: OwidArticleType): OwidArticleErrorMessage[] => {
    const errors: OwidArticleErrorMessage[] = []

    const bodyHandler = new BodyHandler()

    bodyHandler
        .setNext(new TitleHandler())
        .setNext(new SlugHandler())
        .setNext(new PublishedAtHandler())
        .setNext(new ExcerptHandler())
        .setNext(new AttachmentsHandler())

    bodyHandler.handle(gdoc, errors)

    return errors
}

export const getPropertyFirstErrorOfType = (
    type: OwidArticleErrorMessageType,
    property: keyof OwidArticleType | keyof OwidArticleContent,
    errors?: OwidArticleErrorMessage[]
) => errors?.find((error) => error.property === property && error.type === type)

export const getPropertyMostCriticalError = (
    property: keyof OwidArticleType | keyof OwidArticleContent,
    errors: OwidArticleErrorMessage[] | undefined
): OwidArticleErrorMessage | undefined => {
    return (
        getPropertyFirstErrorOfType(
            OwidArticleErrorMessageType.Error,
            property,
            errors
        ) ||
        getPropertyFirstErrorOfType(
            OwidArticleErrorMessageType.Warning,
            property,
            errors
        )
    )
}

const getMissingContentPropertyError = (property: keyof OwidArticleContent) => {
    return {
        property,
        type: OwidArticleErrorMessageType.Error,
        message: `Missing ${property}. Add "${property}: ..." at the top of the Google Doc.`,
    }
}
